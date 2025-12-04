"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <Link
            href="https://tushar-bhardwaj.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            Tushar Bhardwaj
          </Link>
        </p>
      </div>
    </footer>
  )
}

