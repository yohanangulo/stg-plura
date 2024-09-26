/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()
// createNextIntlPlugin = require('next-intl/plugin')

const nextConfig = {
  images: {
    domains: ['uploadthing.com', 'utfs.io', 'img.clerk.com', 'subdomain', 'files.stripe.com'],
  },
  reactStrictMode: false,
}

export default withNextIntl(nextConfig)
