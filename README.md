# LogoGPT - AI Logo Generation SaaS

A full-stack SaaS application for AI-powered logo generation using Next.js, Clerk Auth, OpenAI, and more.

## Features

- 🔐 **Authentication** - Sign in and sign up with Clerk
- 🎨 **Logo Generation** - Generate logos with OpenAI's DALL-E
- 💾 **Dashboard** - View and manage your generated logos
- 🌐 **Responsive Design** - Works on desktop and mobile
- 🔄 **Real-time Updates** - See your generated logos instantly

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API (DALL-E)
- **Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- OpenAI API key
- Clerk account
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/logo-gpt.git
   cd logo-gpt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your API keys.

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - React components
- `lib/` - Utility functions and API clients
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [OpenAI](https://openai.com/)
- [Prisma](https://prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
