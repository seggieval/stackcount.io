import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const form = await req.formData()

    const kind = String(form.get("kind") || "")
    const title = String(form.get("title") || "")
    const details = String(form.get("details") || "")
    const email = String(form.get("email") || "")
    const files = form.getAll("files").filter(Boolean) as File[]

    // Build email body
    const html = `
      <h2>New ${kind.toUpperCase()} submission</h2>
      <p><b>Title:</b> ${title}</p>
      <p><b>Details:</b><br/>${details.replace(/\n/g, "<br/>")}</p>
      <p><b>From:</b> ${email || "Anonymous"}</p>
      ${files.length > 0
        ? `<p><b>Attached files:</b> ${files.map((f) => f.name).join(", ")}</p>`
        : ""
      }
    `

    // Send email
    await resend.emails.send({
      from: "Feedback <onboarding@resend.dev>", // you can change domain later
      to: "kiryha182@gmail.com",
      subject: `New ${kind} submission: ${title}`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Server error." }, { status: 500 })
  }
}
