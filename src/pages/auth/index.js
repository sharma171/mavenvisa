import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Home, CheckCircle, Shield, Zap, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import axiosApi from "networking/axiosApi";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/sliceData";
import { useNavigate, useSearchParams } from "react-router-dom";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone, country) {
  if (country === "US") {
    // US format: +1 (XXX) XXX-XXXX - expect 10 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11;
  } else if (country === "India") {
    // India format: +91 XXXXX XXXXX - expect 10 digits after +91
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 12 && cleaned.startsWith('91'); // 91 + 10 digits
  }
  return false;
}
// Format phone number based on country
function formatPhoneNumber(value, country) {
  if (!value) return value;

  if (country === "US") {
    let cleaned = value.trim();
    // Remove "+1" if present at the start
    if (cleaned.startsWith('+1')) {
      cleaned = cleaned.slice(2).trim();
    }
    // Remove all non-numeric characters
    let x = cleaned.replace(/[^\d]/g, '');
    // Only use first 10 digits
    x = x.substring(0, 10);

    if (!x) return '';
    if (x.length < 4) {
      return '(' + x;
    } else if (x.length < 7) {
      return `(${x.slice(0, 3)}) ${x.slice(3)}`;
    } else {
      return `+1 (${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
    }

  } else if (country === "India") {
    let cleaned = value.trim();
    // Remove "+91" if present at the start
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.slice(3).trim();
    }
    // Remove all non-numeric characters
    let x = cleaned.replace(/[^\d]/g, '');
    // Only use first 10 digits
    x = x.substring(0, 10);

    if (!x) return '';
    if (x.length <= 5) {
      return `+91 ${x}`;
    }
    return `+91 ${x.slice(0, 5)} ${x.slice(5)}`;
  }

  return value;
}




let BaseURL = "https://user-authentication-api-v1-356312339779.us-east1.run.app/";

function Spinner({ size = 4 }) {
  const px = size === 4 ? "w-4 h-4" : size === 5 ? "w-5 h-5" : "w-3 h-3";
  return (
    <svg
      className={`${px} animate-spin inline-block text-current`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}

function AuthLeft({ handleBackToHome }) {
  return (
    <div
      style={{
        height: "max-content",
        position: "sticky",
        top: 0,
        minHeight: "100vh",
      }}
      className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 flex flex-col justify-between p-12 text-white">
        <div>
          <button
            onClick={handleBackToHome}
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 rounded-md text-white hover:bg-white/20 mb-8 p-2"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl" />
            <span className="text-2xl font-bold">MavenVisa</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Your EB-1A Success
            <br />
            <span className="text-accent">Starts Here</span>
          </h1>
          <p className="text-xl opacity-90 mb-12 leading-relaxed">
            Join thousands of professionals who have successfully navigated their visa journey with our expert guidance.
          </p>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-accent">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Expert EB-1A Guidance</h3>
                <p className="opacity-80">Personalized roadmaps tailored to your unique profile</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-accent">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">USCIS-Compliant Process</h3>
                <p className="opacity-80">Follow proven strategies that meet all requirements</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-accent">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Fast-Track Assessment</h3>
                <p className="opacity-80">Get your profile evaluated in just minutes</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm opacity-70">
          <p>Trusted by 500+ professionals worldwide</p>
        </div>
      </div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-40 w-32 h-32 bg-accent/30 rounded-full blur-2xl" />
    </div>
  );
}

function AuthSignIn({ onCreateAccount }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleForgotPassword = () => {
    setResetPassword(true);
    setErrors({});
  };

  const handleBackToSignIn = () => {
    setResetPassword(false);
    setPassword("");
    setErrors({});
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!email) nextErrors.email = "Email is required";
    else if (!validateEmail(email)) nextErrors.email = "Enter a valid email";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setLoading(true);
      const payload = {
        action: "send-password-reset",
        email: email,
      };

      axiosApi
        .post(BaseURL, payload)
        .then((res) => {
          toast.success(res?.data?.message || "Password reset link sent to your email");
          setEmail("");
          setTimeout(() => {
            setResetPassword(false);
          }, 2000);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Failed to send reset link");
          console.log(err.response?.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (resetPassword) {
      handleSendResetEmail(e);
      return;
    }

    const nextErrors = {};
    if (!email) nextErrors.email = "Email is required";
    else if (!validateEmail(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setLoading(true);
      const payload = {
        action: "sign-in",
        username: email,
        password: password,
      };
      axiosApi
        .post(BaseURL, payload)
        .then((res) => {
          localStorage.setItem("userData", JSON.stringify(res.data));
          dispatch(setUserData(res.data));
          toast.success(res?.data?.message || "Sign in successful");
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Sign in failed");
          console.log(err.response.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="lg:hidden mb-8">
          <button
            onClick={handleBackToHome}
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md mb-4 p-2"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
            <span className="text-xl font-bold text-primary">MavenVisa</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
          <div className="rounded-lg text-card-foreground shadow-sm relative bg-white/80 backdrop-blur-sm shadow-elegant border-0 animate-fade-in">
            <div className="flex flex-col space-y-1.5 p-6 text-center pb-8 pt-10">
              <h3 className="tracking-tight text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Welcome Back
              </h3>
              <p className="text-base text-muted-foreground">Access your EB1A consultation portal</p>
            </div>
            <div className="p-6 pt-0 px-8 pb-8">
              <form className="space-y-6" onSubmit={handleSignIn}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      required
                      disabled={loading}
                      className="flex w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-12 bg-white/50 border-border/50 focus:bg-white focus:border-primary transition-all duration-300"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                    />
                    {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                  </div>
                </div>
                {!resetPassword && (
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-foreground"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        required
                        disabled={loading}
                        className="flex w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-12 h-12 bg-white/50 border-border/50 focus:bg-white focus:border-primary transition-all duration-300"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError("password");
                        }}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword((show) => !show)}
                        tabIndex={0}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  {resetPassword ? (
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={handleBackToSignIn}
                      disabled={loading}
                    >
                      ← Back to Sign In
                    </button>
                  ) : (
                    <>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-border/50 text-primary focus:ring-primary"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={loading}
                        />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-primary hover:underline font-medium"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground hover:bg-primary/90 px-4 py-2 w-full h-12 bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Spinner /> <span>{resetPassword ? "Sending..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <>{resetPassword ? "Send Reset Link" : "Sign In"}</>
                  )}
                </button>
              </form>
              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-muted-foreground">New to MavenVisa?</span>
                  </div>
                </div>
                <button
                  className="mt-4 text-primary hover:text-primary/80 font-semibold text-base transition-colors hover:underline"
                  type="button"
                  onClick={onCreateAccount}
                  disabled={loading}
                >
                  Create your account →
                </button>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border/30">
              <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>SSL Protected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthCreateAccount({ onSignIn }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    target_visa_type: "",
    field_of_expertise: "",
    country: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  // ✅ Refs for dropdown containers
  const visaTypeRef = useRef(null);
  const countryRef = useRef(null);
  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (visaTypeRef.current && !visaTypeRef.current.contains(event.target)) {
        setVisaTypeOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [visaTypeOpen, setVisaTypeOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Handle phone number input with formatting
  const handlePhoneInput = (e) => {
    const value = e.target.value;
    const country = form.country;

    if (!country) {
      setErrors((prev) => ({ ...prev, phone: "Please select a country first" }));
      return;
    }

    // Format the phone number based on country
    const formatted = formatPhoneNumber(value, country);
    setForm((prev) => ({ ...prev, phone: formatted }));

    setErrors((prev) => {
      if (!prev.phone) return prev;
      const next = { ...prev };
      delete next.phone;
      return next;
    });
  };

  const handleSelectType = (v) => {
    setForm((prev) => ({ ...prev, target_visa_type: v }));
    setVisaTypeOpen(false);
    setErrors((prev) => {
      if (!prev.target_visa_type) return prev;
      const next = { ...prev };
      delete next.target_visa_type;
      return next;
    });
  };

  const handleSelectCountry = (country) => {
    setForm((prev) => ({ ...prev, country, phone: "" })); // Reset phone when country changes
    setCountryOpen(false);
    setErrors((prev) => {
      if (!prev.country) return prev;
      const next = { ...prev };
      delete next.country;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.first_name) nextErrors.first_name = "First name is required";
    if (!form.last_name) nextErrors.last_name = "Last name is required";
    if (!form.email) nextErrors.email = "Email is required";
    else if (!validateEmail(form.email)) nextErrors.email = "Enter a valid email";
    if (!form.target_visa_type) nextErrors.target_visa_type = "Select a visa type";
    if (!form.field_of_expertise) nextErrors.field_of_expertise = "Field of expertise is required";
    if (!form.country) nextErrors.country = "Country is required";
    if (!form.phone) nextErrors.phone = "Phone is required";
    else if (!validatePhone(form.phone, form.country)) {
      if (form.country === "US") {
        nextErrors.phone = "Enter valid US phone: +1 (XXX) XXX-XXXX";
      } else if (form.country === "India") {
        nextErrors.phone = "Enter valid India phone: +91 XXXXX XXXXX";
      }
    }
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) nextErrors.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setLoading(true);

      let newFormdata = structuredClone(form);
      delete newFormdata.confirmPassword;

      // Clean phone number before sending (remove formatting)
      const cleanedPhone = form.phone.replace(/\D/g, '');
      // For US, send with +1 prefix; for India, send with + prefix
      newFormdata.phone = form.country === "US" ? `+1${cleanedPhone}` : `+${cleanedPhone}`;


      const username = form.email.split("@")[0];

      const payload = {
        action: "sign-up",
        username,
        ...newFormdata,
      };

      axiosApi
        .post(BaseURL, payload)
        .then((res) => {
          toast.success(res?.data?.message || "Account created");
          setTimeout(() => {
            onSignIn();
          }, 200);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Create account failed");
          console.log(err.response.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const visaOptions = [
    { label: "EB-1A (Extraordinary Ability)", value: "EB1A" },
    { label: "O-1A (Extraordinary Ability)", value: "O1A" },
  ];

  const countryOptions = [
    { label: "United States", value: "US", flag: "🇺🇸" },
    { label: "India", value: "India", flag: "🇮🇳" },
  ];

  const selectedVisaLabel =
    visaOptions.find((opt) => opt.value === form?.target_visa_type)?.label || "Select your target visa type";

  const selectedCountryLabel =
    countryOptions.find((opt) => opt.value === form?.country)?.label || "Select your country";

  const getPhonePlaceholder = () => {
    if (!form.country) return "Select country first";
    if (form.country === "US") return "+1 (892) 097-0203";
    if (form.country === "India") return "+91 12345 67890";
    return "";
  };



  const handleBackToHome = () => { };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="lg:hidden mb-8">
          <button
            onClick={handleBackToHome}
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md mb-4 p-2"
            disabled={loading}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
            <span className="text-xl font-bold text-primary">MavenVisa</span>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md mx-auto">
          <div className="flex flex-col space-y-1.5 p-6 text-center">
            <h3 className="tracking-tight text-2xl font-bold text-primary">Create Account</h3>
            <p className="text-sm text-muted-foreground">Start your MavenVisa journey today</p>
          </div>
          <div className="p-6 pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium leading-none">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    required
                    value={form.first_name}
                    onChange={handleInput}
                    disabled={loading}
                  />
                  {errors.first_name && <div className="text-red-600 text-sm mt-1">{errors.first_name}</div>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium leading-none">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    id="last_name"
                    name="last_name"
                    placeholder="Doe"
                    required
                    value={form.last_name}
                    onChange={handleInput}
                    disabled={loading}
                  />
                  {errors.last_name && <div className="text-red-600 text-sm mt-1">{errors.last_name}</div>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <input
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  value={form.email}
                  onChange={handleInput}
                  disabled={loading}
                />
                {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
              </div>

              {/* ✅ Target Visa Type Dropdown with outside click detection */}
              <div className="space-y-2">
                <label htmlFor="target_visa_type" className="text-sm font-medium leading-none">
                  Target Visa Type
                </label>
                <div className="relative" ref={visaTypeRef}>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                    onClick={() => !loading && setVisaTypeOpen((v) => !v)}
                    role="combobox"
                    aria-expanded={visaTypeOpen}
                    disabled={loading}
                  >
                    <span>{selectedVisaLabel}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>

                  {visaTypeOpen && !loading && (
                    <div className="absolute z-10 left-0 w-full mt-1 bg-white border rounded shadow-lg">
                      {visaOptions.map((opt) => (
                        <div
                          key={opt.value}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSelectType(opt.value)}
                          role="option"
                          aria-selected={form.target_visa_type === opt.value}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.target_visa_type && <div className="text-red-600 text-sm mt-1">{errors.target_visa_type}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="field_of_expertise" className="text-sm font-medium leading-none">
                  Field of Expertise
                </label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                  id="field_of_expertise"
                  name="field_of_expertise"
                  placeholder="e.g., Software Engineering, Research, Arts"
                  required
                  value={form.field_of_expertise}
                  onChange={handleInput}
                  disabled={loading}
                />
                {errors.field_of_expertise && (
                  <div className="text-red-600 text-sm mt-1">{errors.field_of_expertise}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* ✅ Country Dropdown with outside click detection */}
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium leading-none">
                    Country
                  </label>
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                      onClick={() => !loading && setCountryOpen((v) => !v)}
                      role="combobox"
                      aria-expanded={countryOpen}
                      disabled={loading}
                    >
                      <span>{selectedCountryLabel}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {countryOpen && !loading && (
                      <div className="absolute z-10 left-0 w-full mt-1 bg-white border rounded shadow-lg">
                        {countryOptions.map((opt) => (
                          <div
                            key={opt.value}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelectCountry(opt.value)}
                            role="option"
                            aria-selected={form.country === opt.value}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.country && <div className="text-red-600 text-sm mt-1">{errors.country}</div>}
                </div>

                {/* Phone Number with Formatting */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium leading-none">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    id="phone"
                    name="phone"
                    placeholder={getPhonePlaceholder()}
                    required
                    value={form.phone}
                    onChange={handlePhoneInput}
                    disabled={loading || !form.country}
                  />
                  {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pr-12"
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    required
                    value={form.password}
                    onChange={handleInput}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pr-12"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    required
                    value={form.confirmPassword}
                    onChange={handleInput}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="text-red-600 text-sm mt-1">{errors.confirmPassword}</div>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-hero text-white shadow-glow hover:shadow-elegant transform hover:scale-105 transition-smooth font-semibold h-10 px-4 py-2 w-full"
              >
                {loading ? (
                  <>
                    <Spinner /> <span>Creating account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button className="text-primary hover:underline font-medium" onClick={onSignIn} disabled={loading}>
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isSignupPage = String(searchParams.get("page")).toLowerCase() == "signup";

  const userData = useSelector((state) => state?.data?.userData);
  let userToken = userData?.token;

  useLayoutEffect(() => {
    setIsCreateAccount(isSignupPage);
  }, [isSignupPage]);

  useEffect(() => {
    if (userToken) {
      navigate("/");
    }
  }, [userToken]);

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <AuthLeft handleBackToHome={handleBackToHome} />
      {isCreateAccount ? (
        <AuthCreateAccount onSignIn={() => setIsCreateAccount(false)} />
      ) : (
        <AuthSignIn onCreateAccount={() => setIsCreateAccount(true)} />
      )}
    </div>
  );
}
