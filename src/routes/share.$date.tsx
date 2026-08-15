import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/share/$date')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/share/$date"!</div>
}
