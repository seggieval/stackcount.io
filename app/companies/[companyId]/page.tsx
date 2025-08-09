import { redirect } from 'next/navigation'

type Props = {
  params: {
    companyId: string
  }
}

export default function CompanyRedirect({ params }: Props) {
  redirect(`/companies/${params.companyId}/dashboard`)
}
