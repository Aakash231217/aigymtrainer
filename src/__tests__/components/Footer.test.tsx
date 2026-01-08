import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer Component', () => {
  it('should render the logo', () => {
    render(<Footer />)
    expect(screen.getByText('Atho')).toBeInTheDocument()
    expect(screen.getByText('nix')).toBeInTheDocument()
  })

  it('should render copyright with current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<Footer />)
    
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /help/i })).toBeInTheDocument()
  })

  it('should have correct href for About link', () => {
    render(<Footer />)
    const aboutLink = screen.getByRole('link', { name: /about/i })
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('should have correct href for Terms link', () => {
    render(<Footer />)
    const termsLink = screen.getByRole('link', { name: /terms/i })
    expect(termsLink).toHaveAttribute('href', '/terms')
  })

  it('should have correct href for Privacy link', () => {
    render(<Footer />)
    const privacyLink = screen.getByRole('link', { name: /privacy/i })
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('should have correct href for Contact link', () => {
    render(<Footer />)
    const contactLink = screen.getByRole('link', { name: /contact/i })
    expect(contactLink).toHaveAttribute('href', '/contact')
  })

  it('should have correct href for Blog link', () => {
    render(<Footer />)
    const blogLink = screen.getByRole('link', { name: /blog/i })
    expect(blogLink).toHaveAttribute('href', '/blog')
  })

  it('should have correct href for Help link', () => {
    render(<Footer />)
    const helpLink = screen.getByRole('link', { name: /help/i })
    expect(helpLink).toHaveAttribute('href', '/help')
  })

  it('should render system status indicator', () => {
    render(<Footer />)
    expect(screen.getByText('SYSTEM OPERATIONAL')).toBeInTheDocument()
  })

  it('should have logo link pointing to home', () => {
    render(<Footer />)
    const logoLinks = screen.getAllByRole('link')
    const homeLink = logoLinks.find(link => link.getAttribute('href') === '/')
    expect(homeLink).toBeInTheDocument()
  })

  it('should render as footer element', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })
})

describe('Footer Accessibility', () => {
  it('should have accessible links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('should render all 7 links (logo + 6 nav links)', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(7)
  })
})
