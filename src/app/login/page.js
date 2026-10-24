'use client';

import { useState } from 'react';
import { Eye, EyeOff, BookOpen, Users, Award, Mail, Lock, User, Phone, ArrowRight, CheckCircle, Shield, Zap, Target, PlayCircle, FileText, Trophy } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState('email');

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', phone: '', email: '', password: '' });
    const [otpForm, setOtpForm] = useState({ otp: '' });
    const [forgotForm, setForgotForm] = useState({ email: '', otp: '', newPassword: '' });
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Placeholder Images
    const DEMO_BG_IMAGE = "./bh.png";
    const DEMO_USER_IMAGE = "/Frame 1000003961.png"; // Ya jo bhi apka user image path hai

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data.user.id);
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("authid", data.user.id);
                router.push("/");
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerForm)
            });

            const data = await response.json();

            if (response.ok) {
                setOtpStep(true);
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/verifyotpregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: registerForm.name,
                    phone: registerForm.phone,
                    email: registerForm.email,
                    password: registerForm.password,
                    otp: otpForm.otp
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account verified successfully!');
                setOtpStep(false);
                setActiveTab('login');
                setRegisterForm({ name: '', phone: '', email: '', password: '' });
                setOtpForm({ otp: '' });
            } else {
                alert(data.message || 'OTP verification failed');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            alert('An error occurred during OTP verification');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotForm.email })
            });

            const data = await response.json();

            if (response.ok) {
                setForgotPasswordStep('otp');
            } else {
                alert(data.message || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            alert('An error occurred while sending reset email');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyForgotOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forget_otpverifiy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: forgotForm.email,
                    otp: forgotForm.otp,
                    newPassword: forgotForm.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setForgotPasswordStep('success');
                setTimeout(() => {
                    setActiveTab('login');
                    setForgotPasswordStep('email');
                    setForgotForm({ email: '', otp: '', newPassword: '' });
                }, 2000);
            } else {
                alert(data.message || 'Password reset failed');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('An error occurred during password reset');
        } finally {
            setLoading(false);
        }
    };

    const resetForgotPassword = () => {
        setForgotPasswordStep('email');
        setForgotForm({ email: '', otp: '', newPassword: '' });
    };

    return (
        // 👇 Maine Background Image main parent container par shift kar di hai
        <div 
            className="min-h-screen flex font-sans relative"
            style={{
                backgroundImage: `url(${DEMO_BG_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
                backgroundAttachment: 'fixed'
            }}
        >
            
            {/* LEFT SIDE - Brand & Marketing */}
           <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-center overflow-hidden">
    
    {/* Background Gradient overlay */}
    <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
    </div>

    {/* 1. Person Image - Size kam kar diya (h-[260px] lagaya hai) */}
    <div className="relative z-10 pt-8 px-10 flex justify-start pointer-events-none">
        <img 
            src={DEMO_USER_IMAGE} 
            alt="Instructor" 
            // Height pehle 350px thi, ab 260px kar di hai. Agar aur chhota karna ho toh isko aur kam kar lein.
            className="h-[180px] lg:h-[260px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
        />
    </div>

    {/* 2. Text Content - Text sizes aur spacing kam kar di gayi hai */}
    <div className="relative z-10 pt-4 px-10 max-w-xl pb-8">
        
        {/* Badge ka size thoda chhota kiya (text-xs, padding kam ki) */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide mb-4 shadow-sm">
            WELCOME BACK! 👋
        </div>
        
        {/* Heading size 6xl se kam karke 4xl/5xl kar diya hai */}
        <h1 className="text-4xl xl:text-5xl font-extrabold text-[#111827] leading-[1.15] mb-4 tracking-tight">
            Master Mining Education.
            <br />
            Anytime. <span className="text-[#1a8965]">Anywhere.</span>
        </h1>
        
        {/* Line ko thoda patla aur chhota kiya */}
        <div className="w-12 h-1 bg-amber-400 mb-4 rounded-full"></div>

        {/* Paragraph ka text size text-lg se text-base kar diya hai */}
        <p className="text-[#374151] text-base font-medium leading-relaxed max-w-sm">
            India&apos;s most trusted learning platform for DGMS, Mining Statutory & Competitive Exams.
        </p>
    </div>

</div>

            {/* RIGHT SIDE - Authentication Form */}
            <div className="w-full lg:w-[42%] flex items-center justify-center p-6 relative z-30">
                
                <div className="w-full max-w-[460px]">
                    {activeTab === 'forgot' ? (
                        /* ================= FORGOT PASSWORD ================= */
                        <div className="bg-white rounded-[24px] shadow-2xl p-8 sm:p-10">
                            <div className="text-left mb-8">
                                <h2 className="text-3xl font-extrabold text-[#111827] mb-2">Reset Password</h2>
                                <p className="text-[#6b7280] text-sm">
                                    {forgotPasswordStep === 'email' && "Enter your email to receive reset instructions."}
                                    {forgotPasswordStep === 'otp' && "Enter the OTP sent to your email."}
                                    {forgotPasswordStep === 'success' && "Password reset successful!"}
                                </p>
                            </div>

                            {forgotPasswordStep === 'email' && (
                                <form onSubmit={handleForgotPassword} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-[#111827] mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type="email" placeholder="Enter your email" value={forgotForm.email} onChange={(e) => setForgotForm({...forgotForm, email: e.target.value})} className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none" required />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-[#1a8965] text-white py-3.5 rounded-xl font-bold hover:bg-[#146c4f] transition-all disabled:opacity-70 flex justify-center items-center">
                                        {loading ? 'Sending...' : 'Send Reset Code'}
                                    </button>
                                </form>
                            )}
                            
                            {forgotPasswordStep === 'otp' && (
                                <form onSubmit={handleVerifyForgotOTP} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-[#111827] mb-2">One Time Password</label>
                                        <input type="text" placeholder="Enter OTP" value={forgotForm.otp} onChange={(e) => setForgotForm({...forgotForm, otp: e.target.value})} className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent text-center text-2xl tracking-widest outline-none" maxLength="6" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#111827] mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type={showPassword ? "text" : "password"} placeholder="New Password" value={forgotForm.newPassword} onChange={(e) => setForgotForm({...forgotForm, newPassword: e.target.value})} className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent outline-none" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-[#1a8965] text-white py-3.5 rounded-xl font-bold hover:bg-[#146c4f] transition-all disabled:opacity-70">
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            {forgotPasswordStep === 'success' && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-[#1a8965]" />
                                    </div>
                                    <p className="text-[#1a8965] font-bold text-xl mb-2">Password reset successfully!</p>
                                </div>
                            )}

                            <div className="text-center mt-6">
                                <button onClick={() => { setActiveTab('login'); resetForgotPassword(); }} className="text-[#1a8965] hover:underline font-semibold text-sm">
                                    ← Back to Login
                                </button>
                            </div>
                        </div>
                    ) : otpStep ? (
                        /* ================= OTP VERIFICATION ================= */
                        <div className="bg-white rounded-[24px] shadow-2xl p-8 sm:p-10">
                           <div className="text-center mb-8">
                                <h2 className="text-3xl font-extrabold text-[#111827] mb-2">Verify Account</h2>
                                <p className="text-[#6b7280] text-sm">Enter the 6-digit OTP sent to <br/><span className="font-bold text-[#111827]">{registerForm.email}</span></p>
                            </div>
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <input type="text" placeholder="000000" value={otpForm.otp} onChange={(e) => setOtpForm({...otpForm, otp: e.target.value})} className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent text-center text-3xl tracking-[1rem] font-bold outline-none" maxLength="6" required />
                                <button type="submit" disabled={loading} className="w-full bg-[#1a8965] text-white py-3.5 rounded-xl font-bold hover:bg-[#146c4f] transition-all disabled:opacity-70 flex items-center justify-center">
                                    {loading ? 'Verifying...' : 'Verify Account'}
                                </button>
                            </form>
                            <div className="text-center mt-6">
                                <button onClick={() => setOtpStep(false)} className="text-[#6b7280] hover:text-[#111827] text-sm font-semibold transition-colors">← Back to Registration</button>
                            </div>
                        </div>
                    ) : (
                        /* ================= MAIN LOGIN / REGISTER ================= */
                        <div className="bg-white rounded-[24px] shadow-2xl p-8 sm:p-10 relative">
                            
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-[#111827] mb-2">
                                        {activeTab === 'login' ? 'Login to Your Account' : 'Create an Account'}
                                    </h2>
                                    <p className="text-[#6b7280] text-sm font-medium">
                                        {activeTab === 'login' ? 'Welcome back! Please login to continue learning.' : 'Start your mining education journey today.'}
                                    </p>
                                </div>
                                {/* Top Right Icon Badge */}
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-100/50 hidden sm:flex">
                                    <span className="text-xl">👷</span> 
                                </div>
                            </div>

                            {activeTab === 'login' ? (
                                /* LOGIN FORM */
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#111827] mb-2">Email Address / Mobile Number</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type="text" placeholder="Enter your email or mobile number" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none text-[#111827] text-sm" required />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#111827] mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none text-[#111827] text-sm" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#111827] transition-colors">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => setActiveTab('forgot')} className="text-[#1a8965] hover:underline font-bold text-[13px]">
                                            Forgot Password?
                                        </button>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full bg-[#176a4f] text-white py-3.5 rounded-xl font-bold hover:bg-[#125841] transition-all disabled:opacity-70 flex items-center justify-center group relative overflow-hidden mt-2">
                                        <span className="relative z-10">{loading ? 'Logging in...' : 'Login'}</span>
                                        {!loading && (
                                            <div className="absolute right-4 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                                                <ArrowRight className="w-4 h-4 text-gray-900" />
                                            </div>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* REGISTER FORM */
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#111827] mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type="text" placeholder="Enter your name" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none text-[#111827] text-sm" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#111827] mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type="tel" placeholder="Enter phone number" value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none text-[#111827] text-sm" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#111827] mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type="email" placeholder="Enter email address" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none text-[#111827] text-sm" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#111827] mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input type={showConfirmPassword ? "text" : "password"} placeholder="Create password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a8965] focus:border-transparent transition-all outline-none text-[#111827] text-sm" required />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#111827] transition-colors">
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="w-4 h-4 text-[#1a8965] border-gray-300 rounded focus:ring-[#1a8965] cursor-pointer" />
                                        <label htmlFor="terms" className="text-[13px] text-[#6b7280] cursor-pointer">
                                            I agree to the <a href="#" className="text-[#1a8965] font-bold hover:underline">Terms of Service</a> & <a href="#" className="text-[#1a8965] font-bold hover:underline">Privacy Policy</a>
                                        </label>
                                    </div>

                                    <button type="submit" disabled={loading || !acceptTerms} className="w-full bg-[#176a4f] text-white py-3.5 rounded-xl font-bold hover:bg-[#125841] transition-all disabled:opacity-70 mt-2 flex justify-center items-center">
                                        {loading ? 'Creating...' : 'Create Account'}
                                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                                    </button>
                                </form>
                            )}

                            {/* Divider */}
                            <div className="relative my-7">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-[13px]">
                                    <span className="px-4 bg-white text-[#6b7280] font-medium">or continue with</span>
                                </div>
                            </div>

                            {/* Social Logins */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <button type="button" className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                                    </svg>
                                    <span className="text-[13px] font-bold text-[#111827]">Google</span>
                                </button>
                                <button type="button" className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span className="text-[13px] font-bold text-[#111827]">Facebook</span>
                                </button>
                            </div>

                            {/* Security Badge */}
                            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl py-3 px-4 flex items-center justify-center space-x-2">
                                <Shield className="w-4 h-4 text-[#16a34a]" />
                                <span className="text-[13px] text-[#166534]">Your data is safe and secure with <strong className="font-bold">MiningShiksha</strong></span>
                            </div>

                            {/* Register/Login Toggle in top corner */}
                            <div className="absolute top-4 right-8 left-8 flex justify-end">
                                {activeTab === 'login' ? (
                                    <p className="text-xs text-gray-500 mt-2">Don&apos;t have an account? <button onClick={() => setActiveTab('register')} className="text-[#1a8965] font-bold hover:underline">Register</button></p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-2">Already have an account? <button onClick={() => setActiveTab('login')} className="text-[#1a8965] font-bold hover:underline">Login</button></p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}