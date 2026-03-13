package tokenprocessing

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	db "github.com/mikeydub/go-gallery/db/gen/coredb"
	"github.com/mikeydub/go-gallery/platform"
	"github.com/mikeydub/go-gallery/service/limiters"
	"github.com/mikeydub/go-gallery/service/multichain"
	"github.com/mikeydub/go-gallery/service/persist/postgres"
	sentryutil "github.com/mikeydub/go-gallery/service/sentry"
	"github.com/mikeydub/go-gallery/service/task"
	"github.com/mikeydub/go-gallery/service/throttle"
	"github.com/mikeydub/go-gallery/service/tokenmanage"
)

func handlersInitServer(ctx context.Context, router *gin.Engine, tp *tokenProcessor, mc *multichain.Provider, tokenManageCache *throttle.MemoryStore, repos *postgres.Repositories, taskClient *task.Client) *gin.Engine {
	// Handles retries and token state
	fastRetry := limiters.NewMemoryKeyRateLimiter("tickFast", 1, 30*time.Second)
	slowRetry := limiters.NewMemoryKeyRateLimiter("tickSlow", 1, 5*time.Minute)

	refreshManager := tokenmanage.New(taskClient, tokenManageCache, tickTokenSyncF(ctx, fastRetry, slowRetry))
	syncManager := tokenmanage.NewWithRetries(taskClient, tokenManageCache, maxRetriesForTokenSync, tickTokenSyncF(ctx, fastRetry, slowRetry))

	mediaGroup := router.Group("/media")
	mediaGroup.POST("/process", func(c *gin.Context) {
		if hub := sentryutil.SentryHubFromContext(c); hub != nil {
			hub.Scope().AddEventProcessor(sentryutil.SpanFilterEventProcessor(c, 1000, 1*time.Millisecond, 8, true))
		}
		processBatch(tp, mc.Queries, taskClient, syncManager)(c)
	})
	mediaGroup.POST("/process/token", processMediaForTokenIdentifiers(tp, mc.Queries, refreshManager))
	mediaGroup.POST("/tokenmanage/process/token", processMediaForTokenManaged(tp, mc.Queries, taskClient, syncManager))
	mediaGroup.POST("/process/post-preflight", processPostPreflight(tp, mc, repos.UserRepository, taskClient, syncManager))

	ownersGroup := router.Group("/owners")
	ownersGroup.POST("/process/wallet-removal", processWalletRemoval(mc.Queries))

	contractsGroup := router.Group("/contracts")
	contractsGroup.POST("/detect-spam", detectSpamContracts(mc.Queries))

	return router
}

func tickTokenSyncF(ctx context.Context, fastRetry, slowRetry *limiters.MemoryKeyRateLimiter) tokenmanage.TickTokenF {
	return func(td db.TokenDefinition) (time.Duration, error) {
		if platform.IsProhibition(td.Chain, td.ContractAddress) || td.IsFxhash {
			_, delay, err := fastRetry.ForKey(ctx, td.ID.String())
			return delay, err
		}
		_, delay, err := slowRetry.ForKey(ctx, td.ID.String())
		return delay, err
	}
}

func maxRetriesForTokenSync(td db.TokenDefinition) int {
	if platform.IsProhibition(td.Chain, td.ContractAddress) || td.IsFxhash {
		return 24
	}
	return 2
}
