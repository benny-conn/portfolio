import FeatureCard from "@/components/FeatureCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Briefcase,
  ChartNoAxesColumnIncreasing,
  Crown,
  Grid,
  HandCoins,
  ImageIcon,
  MapPin,
  Megaphone,
  Settings,
  Users2,
  Waypoints,
} from "lucide-react"
import Image from "next/image"
import ContactButton from "./ContactButton"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

export default function Work() {
  return (
    <div className="flex flex-col gap-4" id="work">
      <h2 className="text-6xl sm:text-8xl font-haas-bold ">My work</h2>
      <Separator className="w-full my-8" />
      <div className="flex flex-col gap-32">
        <Gig />
        <Gallery />
        <Minecraft />
      </div>
    </div>
  )
}

const Gig = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative h-32 w-64">
            <Image
              src="/gig-secondary.png"
              alt="gig app logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex flex-row gap-1 items-center flex-wrap">
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/expo.png"
                alt="expo logo"
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/rn.svg"
                alt="expo logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/nextjs.svg"
                alt="nextjs logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/golang.png"
                alt="golang logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/postgres.png"
                alt="postgres logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/redis.svg"
                alt="redis logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-16 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/stripe.png"
                alt="stripe logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/docker.svg"
                alt="docker logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-16 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/hetzner.png"
                alt="hetzner logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <h3 className="text-2xl text-muted-foreground">
          Founder and Programmer
        </h3>
        <p className="text-xl max-w-prose">
          <span className="font-haas-bold hover:underline text-brand">
            <a href="https://gig.app" target="_blank">
              The Gig App
            </a>
          </span>{" "}
          is the all-in-one tool for musicians to level up their career, helping
          them streamline the booking of gigs, grow their fanbases, and earn
          more income from their music.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-4 w-full">
          <FeatureCard
            icon={MapPin}
            title="Find gigs"
            description="Musicians discover and book gigs in their area through the app, and fans find local live music events that aren't listed on the big ticketing sites."
          />
          <FeatureCard
            icon={Megaphone}
            title="Grow your audience"
            description="Tools to help musicians grow their fanbase like free and paid newsletters and communities, simple tip collection, merch sales, knowledge sharing, and more."
          />

          <FeatureCard
            icon={Users2}
            title="Find Bandmates"
            description="Use a friend-of-a-friend algorithm to find other musicians to play with whether that be adding a new permanent band member or finding subs for a gig."
          />
          <FeatureCard
            icon={Settings}
            title="Automate the busy work"
            description="Automate everything from sending reminders to bandmates about rehearsals and gig details, letting your followers know when and where you are playing, and even splitting the payout with your bandmates."
          />
        </div>
        <div className="w-full relative h-[600px]">
          <Image
            src="/app-screen-artist.png"
            fill
            className="object-contain"
            alt="gig.app musician screen"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <ContactButton
          variant="secondary"
          className="h-12 rounded-full text-xl font-haas-bold px-12"
        />
        <Button
          className="px-12 rounded-full h-12 font-haas-bold text-xl"
          size="lg">
          <a href="https://gig.app" target="_blank">
            Download The App
          </a>
        </Button>
      </div>
    </div>
  )
}

const Gallery = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 md:items-end">
        <div className="flex flex-col md:flex-row-reverse gap-4">
          <div className="relative h-32 w-64">
            <Image
              src="/gallery.svg"
              alt="gallery logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-row gap-1 items-center">
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/golang.png"
                alt="golang logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/google-cloud.svg"
                alt="gcp logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/docker.svg"
                alt="docker logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/postgres.png"
                alt="postgres logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/redis.svg"
                alt="redis logo"
                fill
                className="object-contain p-1"
              />
            </div>
          </div>
        </div>
        <h3 className="text-2xl text-muted-foreground">Backend Programmer</h3>
        <p className="text-xl max-w-prose md:text-right">
          <span className="font-haas-bold hover:underline text-brand">
            <a href="https://gallery.so" target="_blank">
              Gallery
            </a>
          </span>{" "}
          is a social platform designed for the sharing of art.
        </p>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-4">
        <div className="flex flex-col gap-4 w-full">
          <FeatureCard
            icon={ImageIcon}
            title="Media Processing Pipeline"
            description="Orchestrated and implemented an ffmpeg based media processing pipeline capable of transcoding and resizing millions of images and videos with concurrency at scale (3M while I was there) with multiple layers of redundancy and fault tolerance."
          />
          <FeatureCard
            icon={Bell}
            title="Live Notifications"
            description="Implemented a live notifications system that sends push notifications and web notifications to users across all parts of the application."
          />

          <FeatureCard
            icon={Waypoints}
            title="GraphQL API and Cloud Architecture"
            description="Implemented the GraphQL API and designed the cloud architecture of the application. Used Google Cloud Run for the API and Google Cloud SQL for the database."
          />
          <FeatureCard
            icon={ChartNoAxesColumnIncreasing}
            title="Incremental User Syncing"
            description="Wrote an incremental update pattern for syncing third party data for users of the application. This allowed the user to interact with the site while the syncing was happening in the background."
          />
        </div>
        <div className="w-full relative md:h-[600px] h-[300px] rounded-lg overflow-hidden my-8 md:m-16">
          <Image
            src="/gallery-home.png"
            fill
            className="object-cover"
            alt="gallery home screen"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center md:justify-end gap-4">
        <ContactButton
          variant="secondary"
          className="h-12 rounded-full text-xl font-haas-bold px-12"
        />
        <Button
          className="px-12 rounded-full h-12 font-haas-bold text-xl"
          size="lg">
          <a
            href="https://github.com/gallery-so/go-gallery"
            target="_blank"
            className="flex items-center gap-2">
            <GitHubLogoIcon className="w-6 h-6" /> See the Open Source Repo
          </a>
        </Button>
      </div>
    </div>
  )
}

const Minecraft = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative h-32 w-64">
            <Image
              src="/minecraft.svg"
              alt="minecraft logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-row gap-1 items-center">
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/java.webp"
                alt="java logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="h-8 w-8 relative border border-border rounded-sm bg-neutral-800">
              <Image
                src="/kotlin.svg"
                alt="kotlin logo"
                fill
                className="object-contain p-1.5"
              />
            </div>
          </div>
        </div>
        <h3 className="text-2xl text-muted-foreground">Programmer</h3>
        <p className="text-xl max-w-prose">
          I have developed multiple{" "}
          <span className="font-haas-bold hover:underline text-brand">
            <a
              href="https://github.com/benny-conn/Civilizations"
              target="_blank">
              Minecraft Plugins
            </a>
          </span>{" "}
          that are used by thousands of public and private multiplayer servers
          across the globe. These plugins enhance the multiplayer game
          experience by adding new features and mechanics to the game.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-4 w-full">
          <FeatureCard
            icon={Grid}
            title="Towny Menu"
            description="My most popular plugin adds a visual administration menu to another popular plugin, Towny, that allows users to easily manage their towns and plots without needing to type commands."
            link="https://github.com/benny-conn/TownyMenu"
          />
          <FeatureCard
            icon={Crown}
            title="Civilizations"
            description="My most complex and feature rich plugin is a multiplayer land claiming and politics system. It allows players to claim land, build cities, and declare war on other players with real economic impact on the server."
            link="https://github.com/benny-conn/Civilizations"
          />

          <FeatureCard
            icon={Briefcase}
            title="Bundle"
            description="A package manager for Minecraft plugins that allows users to easily install and update plugins from a central repository. The traditional way of installing plugins was to download tens of zip filse and copy them into the plugins folder."
            link="https://github.com/benny-conn/bundle"
          />
          <FeatureCard
            icon={HandCoins}
            title="Trader"
            description="A plugin that allows players to initiate safe trades with each other."
            link="https://github.com/benny-conn/Trader"
          />
        </div>
        <div className="w-full relative md:h-[600px] h-[300px] rounded-lg overflow-hidden my-8 md:m-16">
          <Image
            src="/plugin.png"
            fill
            className="object-cover"
            alt="minecraft plugin in action"
          />
        </div>
      </div>
    </div>
  )
}
