/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// SOI Brand Color System
  			'soi': {
  				navy: {
  					50: '#f0f4f8',
  					100: '#d9e6f2', 
  					200: '#b3cce5',
  					300: '#8db3d8',
  					400: '#6799cb',
  					500: '#4180be',
  					600: '#356691',
  					700: '#2a4d6b',
  					800: '#1e3a5f',  // PRIMARY SOI NAVY
  					900: '#162d47',
  					950: '#0f1f33'
  				},
  				purple: {
  					50: '#f7f4f9',
  					100: '#ede6f0',
  					200: '#dbd0e1',
  					300: '#c3b1cc',
  					400: '#a68bb3',
  					500: '#8B5C9E',  // PRIMARY SOI PURPLE
  					600: '#7a4f8c',
  					700: '#684274',
  					800: '#563760',
  					900: '#472f50',
  					950: '#2d1e32'
  				},
  				pink: {
  					50: '#faf7f8',
  					100: '#f4ecf1',
  					200: '#ead9e3',
  					300: '#dbc0cd',
  					400: '#c79db0',
  					500: '#d4a5b8',  // PRIMARY SOI PINK
  					600: '#b88ca0',
  					700: '#9d7487',
  					800: '#836071',
  					900: '#6d505e',
  					950: '#422f37'
  				},
  				mint: {
  					50: '#f4f8f4',
  					100: '#e6f2e6',
  					200: '#cde5cd',
  					300: '#a8d1a8',
  					400: '#7db87d',
  					500: '#a8c4a2',  // PRIMARY SOI MINT
  					600: '#8fb089',
  					700: '#769670',
  					800: '#5f7a5f',
  					900: '#4f644f',
  					950: '#2a362a'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			shimmer: {
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: 1
  				},
  				'50%': {
  					opacity: 0.7
  				}
  			},
  			'scale-in': {
  				from: {
  					opacity: 0,
  					transform: 'scale(0.95)'
  				},
  				to: {
  					opacity: 1,
  					transform: 'scale(1)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-down': {
  				'0%': {
  					transform: 'translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			// SOI Brand Animation Enhancements
  			'float-slow': {
  				'0%, 100%': {
  					transform: 'translateY(0px) rotate(0deg)'
  				},
  				'50%': {
  					transform: 'translateY(-20px) rotate(5deg)'
  				}
  			},
  			'float-medium': {
  				'0%, 100%': {
  					transform: 'translateY(0px) rotate(0deg)'
  				},
  				'50%': {
  					transform: 'translateY(-15px) rotate(-3deg)'
  				}
  			},
  			'float-fast': {
  				'0%, 100%': {
  					transform: 'translateY(0px) rotate(0deg)'
  				},
  				'50%': {
  					transform: 'translateY(-10px) rotate(2deg)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			shimmer: 'shimmer 2s infinite linear',
  			float: 'float 3s ease-in-out infinite',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'slide-down': 'slide-down 0.3s ease-out',
  			// SOI Brand Animations
  			'float-slow': 'float-slow 6s ease-in-out infinite',
  			'float-medium': 'float-medium 4s ease-in-out infinite',
  			'float-fast': 'float-fast 3s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/aspect-ratio"), require("@tailwindcss/typography")],
}; 