import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Heart, Activity, Stethoscope, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useAuth } from '../firebase/useAuth';

export const AuthPage = () => {
    const { login, signup, signInWithGoogle } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                await signup(formData.email, formData.password, formData.name);
            } else {
                await login(formData.email, formData.password);
            }
        } catch (err: any) {
            let message = "An error occurred. Please try again.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                message = "Invalid email or password.";
            } else if (err.code === 'auth/email-already-in-use') {
                message = "This email is already registered.";
            } else if (err.code === 'auth/weak-password') {
                message = "Password should be at least 6 characters.";
            } else {
                message = err.message?.replace('Firebase: ', '') || message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300/10 rounded-full blur-2xl" />
                </div>

                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-38 left-109 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30"
                >
                    <Heart className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-30 left-53 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30"
                >
                    <Activity className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/2 left-140 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30"
                >
                    <Stethoscope className="w-8 h-8 text-white" />
                </motion.div>

                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="">
                            <span className="text-emerald-600 font-bold text-2xl"></span>
                        </div>
                        <h1 className="text-3xl font-semibold text-white">MediCare</h1>
                    </div>

                    <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                        Your Health,<br />
                        Our <span className="text-amber-300">Innovation</span>.
                    </h2>

                    <p className="text-emerald-100 text-lg max-w-md leading-relaxed mb-10">
                        Experience the future of healthcare with AI-powered diagnostics,
                        instant consultations, and personalized treatment plans.
                    </p>

                    <div className="flex gap-6">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20">
                            <p className="text-3xl font-bold text-white">10K+</p>
                            <p className="text-emerald-200 text-sm">Active Users</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20">
                            <p className="text-3xl font-bold text-white">98%</p>
                            <p className="text-emerald-200 text-sm">Accuracy Rate</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20">
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-emerald-200 text-sm">AI Support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="bg-emerald-600 p-2 rounded-xl">
                            <span className="text-white font-bold text-xl">✚</span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">MediCare</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-muted-foreground">
                            {isSignUp ? 'Join thousands improving their health with AI' : 'Sign in to continue your health journey'}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={signInWithGoogle}
                        className="w-full h-12 mb-6 bg-gray-100  hover:bg-gray-50  text-foreground font-medium rounded-xl flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Label htmlFor="name" className="text-foreground font-medium mb-2 block">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="pl-12 h-12 bg-white border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required={isSignUp} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <Label htmlFor="email" className="text-foreground font-medium mb-2 block">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="email" name="email" type="email" placeholder="hello@medicare.ai" value={formData.email} onChange={handleInputChange} className="pl-12 h-12 bg-white border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-foreground font-medium mb-2 block">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="password" value={formData.password} onChange={handleInputChange} className="pl-12 pr-12 h-12 bg-white border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {!isSignUp && (
                            <div className="flex justify-end">
                                <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-muted-foreground">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>

                    {/* RESTORED: Footer Links */}
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;