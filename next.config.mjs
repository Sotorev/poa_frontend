/** @type {import('next').NextConfig} */
const nextConfig = {
	// reactStrictMode: true,
	env: {
		SECRET_COOKIE_PASSWORD: process.env.JWT_SECRET,
	},	
};

export default nextConfig;
