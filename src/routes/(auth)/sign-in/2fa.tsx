import { createFileRoute, useRouter } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { VerifyForm } from '@/features/auth/components/verify-form'
import { useOtpFlow } from '@/features/auth/hooks/use-otp-flow'
import { otpContext } from '@/features/auth/utils/otp-context'

export const Route = createFileRoute('/(auth)/sign-in/2fa')({
  beforeLoad: () => {
    otpContext.validate('otp:login-2fa', 'sign_in_2fa', '/sign-in')
  },
  component: SignInTwoFactorComponent,
})

function SignInTwoFactorComponent() {
  const router = useRouter()
  const ctx = otpContext.get('otp:login-2fa')
  const email = ctx?.email || ''

  const baseFlow = useOtpFlow({
    onVerify: async (code) => {
      const { error } = await authClient.twoFactor.verifyOtp({ code })
      if (!error) {
        const destination = otpContext.handleSuccess('otp:login-2fa', '/')
        router.navigate({ to: destination, replace: true })
      }
      return { error }
    },
    onResend: async () => {
      return await authClient.twoFactor.sendOtp()
    },
    cooldownDuration: 60,
  })

  return (
    <AuthLayout
      title='Two-factor authentication'
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
