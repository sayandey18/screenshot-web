import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/features/auth/forgot'

export const Route = createFileRoute('/(auth)/forgot/')({
  component: ForgotPassword,
})
