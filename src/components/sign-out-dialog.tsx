import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    await authClient.signOut()
    auth.reset()
    navigate({
      to: '/sign-in',
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={() => { void handleSignOut() }}
      className='sm:max-w-sm'
    />
  )
}
