import { createFileRoute, useRouter } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { VerifyForm } from '@/features/auth/components/verify-form'
import { useOtpFlow } from '@/features/auth/hooks/use-otp-flow'
import { otpContext } from '@/features/auth/utils/otp-context'

export const Route = createFileRoute('/(auth)/sign-up/verify')({
  beforeLoad: () => {
    otpContext.validate('otp:signup', 'sign_up_verify', '/sign-up')
  },
  component: SignUpVerifyComponent,
})

function SignUpVerifyComponent() {
  const router = useRouter()
  const ctx = otpContext.get('otp:signup')
  const email = ctx?.email || ''

  const baseFlow = useOtpFlow({
    onVerify: async (code) => {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      })
      if (!error) {
        const destination = otpContext.handleSuccess('otp:signup', '/')
        router.navigate({ to: destination, replace: true })
      }
      return { error }
    },
    onResend: async () => {
      return await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })
    },
    cooldownDuration: 60,
  })

  return (
    <AuthLayout
      title='Verify your email'
      description={
        <>
          Enter the 6-digit code we sent to{' '}
          <span className='font-medium text-foreground'>{email}</span>
        </>
      }
    >
      <VerifyForm {...baseFlow} />
    </AuthLayout>
  )
}
