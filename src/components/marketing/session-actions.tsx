import { cache, Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { currentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { SiteNav } from "./site-nav";

// Share one session lookup per server render. Marketing content never waits for it.
const marketingUser = cache(currentUser);

function StartLink({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <Button asChild>
      <Link href={signedIn ? "/dashboard" : "/login"}>
        {signedIn ? "View Dashboard" : "Get Started"}
        <ArrowUpRight size={18} />
      </Link>
    </Button>
  );
}

async function ResolvedCta() {
  return <StartLink signedIn={Boolean(await marketingUser())} />;
}

async function ResolvedNav() {
  return <SiteNav signedIn={Boolean(await marketingUser())} />;
}

export function SessionCta() {
  return (
    <Suspense fallback={<StartLink />}>
      <ResolvedCta />
    </Suspense>
  );
}

export function SessionNav() {
  return (
    <Suspense fallback={<SiteNav signedIn={false} />}>
      <ResolvedNav />
    </Suspense>
  );
}
