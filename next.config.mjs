/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		SECRET_COOKIE_PASSWORD: process.env.SECRET_COOKIE_PASSWORD,
	}
};

export default nextConfig;
