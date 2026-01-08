import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserPrograms from '@/components/UserPrograms'

vi.mock('@/constants', () => ({
  USER_PROGRAMS: [
    {
      id: 1,
      first_name: 'TestUser',
      profilePic: 'https://example.com/pic.jpg',
      fitness_goal: 'Weight Loss',
      height: '5\'10"',
      weight: '180 lbs',
      age: 30,
      workout_days: 4,
      injuries: 'None',
      fitness_level: 'Intermediate',
      equipment_access: 'Full gym',
      dietary_restrictions: 'None',
      workout_plan: {
        title: 'Test Workout Plan',
        weekly_schedule: [
          { day: 'Monday', focus: 'Chest', duration: '45 min' },
        ],
        description: 'Test description',
      },
      diet_plan: {
        title: 'Test Diet Plan',
        daily_calories: '2000 calories',
        macros: { protein: '30%', carbs: '40%', fats: '30%' },
        meal_examples: [
          { meal: 'Breakfast', example: 'Oatmeal' },
        ],
        description: 'Test diet description',
      },
    },
  ],
}))

describe('UserPrograms Component', () => {
  it('should render without crashing', () => {
    render(<UserPrograms />)
    expect(screen.getByText('Program Gallery')).toBeInTheDocument()
  })

  it('should display the main heading', () => {
    render(<UserPrograms />)
    expect(screen.getByText('AI-Generated')).toBeInTheDocument()
    expect(screen.getByText('Programs')).toBeInTheDocument()
  })

  it('should display the subheading', () => {
    render(<UserPrograms />)
    expect(
      screen.getByText(/Explore personalized fitness plans/)
    ).toBeInTheDocument()
  })

  it('should display program stats', () => {
    render(<UserPrograms />)
    expect(screen.getByText('500+')).toBeInTheDocument()
    expect(screen.getByText('3min')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should display programs label', () => {
    render(<UserPrograms />)
    expect(screen.getByText('PROGRAMS')).toBeInTheDocument()
  })

  it('should display creation time label', () => {
    render(<UserPrograms />)
    expect(screen.getByText('CREATION TIME')).toBeInTheDocument()
  })

  it('should display personalized label', () => {
    render(<UserPrograms />)
    expect(screen.getByText('PERSONALIZED')).toBeInTheDocument()
  })

  it('should render user program cards', () => {
    render(<UserPrograms />)
    expect(screen.getByText('TestUser')).toBeInTheDocument()
  })

  it('should display user fitness level', () => {
    render(<UserPrograms />)
    expect(screen.getByText('INTERMEDIATE')).toBeInTheDocument()
  })

  it('should display user ID', () => {
    render(<UserPrograms />)
    expect(screen.getByText('USER.1')).toBeInTheDocument()
  })

  it('should display featured plans label', () => {
    render(<UserPrograms />)
    expect(screen.getByText('Featured Plans')).toBeInTheDocument()
  })
})

describe('UserPrograms Styling', () => {
  it('should have container with proper max-width', () => {
    const { container } = render(<UserPrograms />)
    const maxWidthContainer = container.querySelector('.max-w-6xl')
    expect(maxWidthContainer).toBeInTheDocument()
  })

  it('should have grid layout for cards', () => {
    const { container } = render(<UserPrograms />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })

  it('should have backdrop blur styling', () => {
    const { container } = render(<UserPrograms />)
    const blurElements = container.querySelectorAll('.backdrop-blur-sm')
    expect(blurElements.length).toBeGreaterThan(0)
  })
})
