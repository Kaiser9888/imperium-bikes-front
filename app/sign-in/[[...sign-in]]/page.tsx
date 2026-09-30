import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" /></main>
}
