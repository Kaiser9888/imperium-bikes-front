import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/" /></main>
}
