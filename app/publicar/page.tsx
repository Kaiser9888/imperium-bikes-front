import { redirect } from "next/navigation"

/** A escolha de categoria agora fica na Central do vendedor. */
export default function PublicarPage() {
  redirect("/vendedor#publicar")
}
