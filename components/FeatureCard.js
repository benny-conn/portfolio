import { GitHubLogoIcon } from "@radix-ui/react-icons"

export default function FeatureCard({ icon: Icon, title, description, link }) {
  return (
    <div className="flex flex-row items-center gap-4 border border-border rounded-lg p-4 bg-neutral-900">
      <Icon className="h-10 w-10 text-primary mb-2" />
      <div className="flex-1 flex-col">
        <h3 className="text-xl">{title}</h3>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      {link && (
        <a href={link} target="_blank">
          <GitHubLogoIcon className="w-8 h-8" />
        </a>
      )}
    </div>
  )
}
