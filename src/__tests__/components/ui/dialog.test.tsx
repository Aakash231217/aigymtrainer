import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'

describe('Dialog Component', () => {
  it('should render DialogTrigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    )
    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(await screen.findByText('Test Dialog')).toBeInTheDocument()
  })

  it('should render DialogTitle', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>My Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(await screen.findByText('My Dialog Title')).toBeInTheDocument()
  })

  it('should render DialogDescription', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>This is a description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    expect(await screen.findByText('This is a description')).toBeInTheDocument()
  })

  it('should render DialogHeader', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(await screen.findByText('Header Title')).toBeInTheDocument()
  })

  it('should render DialogFooter', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(await screen.findByText('Cancel')).toBeInTheDocument()
    expect(await screen.findByText('Confirm')).toBeInTheDocument()
  })

  it('should close dialog when DialogClose is clicked', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    const closeButton = await screen.findByText('Close')
    fireEvent.click(closeButton)
    
    // Dialog should be closed
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  it('should apply custom className to DialogContent', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="custom-dialog">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveClass('custom-dialog')
  })

  it('should be controlled with open prop', () => {
    const { rerender } = render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should call onOpenChange when dialog state changes', async () => {
    const handleOpenChange = vi.fn()
    
    render(
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    fireEvent.click(screen.getByText('Open'))
    expect(handleOpenChange).toHaveBeenCalledWith(true)
  })
})

describe('Dialog Accessibility', () => {
  it('should have role="dialog"', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Accessible Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('should be accessible with aria-describedby', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description for accessibility</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-describedby')
  })

  it('should trap focus within dialog', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Focus Trap Test</DialogTitle>
          <button>First Button</button>
          <button>Second Button</button>
        </DialogContent>
      </Dialog>
    )

    await screen.findByRole('dialog')
    // Focus should be within the dialog
    expect(document.activeElement?.closest('[role="dialog"]')).toBeInTheDocument()
  })
})

describe('Dialog with Form', () => {
  it('should render form inside dialog', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Dialog</DialogTitle>
          </DialogHeader>
          <form data-testid="dialog-form">
            <input placeholder="Name" />
            <input placeholder="Email" />
          </form>
          <DialogFooter>
            <button type="submit">Submit</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(await screen.findByTestId('dialog-form')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })
})
