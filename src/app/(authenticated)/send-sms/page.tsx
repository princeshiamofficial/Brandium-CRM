import { redirect } from "next/navigation";

export default function SendSmsRedirect() {
  redirect("/sms/send");
}
