import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card Component', () => {
  it('should render Card with children', () => {
    render(<Card>Card Content</Card>)
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Card className="custom-card">Content</Card>)
    const card = screen.getByText('Content').parentElement || screen.getByText('Content')
    expect(card).toHaveClass('custom-card')
  })

  it('should forward ref to Card', () => {
    const ref = { current: null }
    render(<Card ref={ref}>Content</Card>)
    expect(ref.current).not.toBeNull()
  })
})

describe('CardHeader Component', () => {
  it('should render CardHeader with children', () => {
    render(<CardHeader>Header Content</CardHeader>)
    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)
    const header = screen.getByText('Header')
    expect(header).toHaveClass('custom-header')
  })
})

describe('CardTitle Component', () => {
  it('should render CardTitle with text', () => {
    render(<CardTitle>My Title</CardTitle>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title).toHaveClass('custom-title')
  })

  it('should render as heading element', () => {
    render(<CardTitle>Title</CardTitle>)
    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
  })
})

describe('CardDescription Component', () => {
  it('should render CardDescription with text', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CardDescription className="custom-desc">Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc).toHaveClass('custom-desc')
  })
})

describe('CardContent Component', () => {
  it('should render CardContent with children', () => {
    render(<CardContent>Main content here</CardContent>)
    expect(screen.getByText('Main content here')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)
    const content = screen.getByText('Content')
    expect(content).toHaveClass('custom-content')
  })
})

describe('CardFooter Component', () => {
  it('should render CardFooter with children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('custom-footer')
  })
})

describe('Card Composition', () => {
  it('should render complete Card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('This is a description')).toBeInTheDocument()
    expect(screen.getByText('Main content goes here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('should render Card without optional sub-components', () => {
    render(
      <Card>
        <CardContent>Just content</CardContent>
      </Card>
    )

    expect(screen.getByText('Just content')).toBeInTheDocument()
  })
})
