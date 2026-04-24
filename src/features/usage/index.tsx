import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsageDialogs } from './components/usage-dialogs'
import { UsageProvider } from './components/usage-provider'
import { UsageTable } from './components/usage-table'
import { usageLogs } from './data/usage'

export function Usage() {
  return (
    <UsageProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Usage</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your API screenshot logs for this month!
            </p>
          </div>
        </div>
        <UsageTable data={usageLogs} />
      </Main>

      <UsageDialogs />
    </UsageProvider>
  )
}
