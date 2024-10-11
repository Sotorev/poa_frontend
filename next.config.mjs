/** @type {import('next').NextConfig} */
const nextConfig = {
	// reactStrictMode: true,
	env: {
		SECRET_COOKIE_PASSWORD: process.env.JWT_SECRET,
		NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL,
	},	
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
