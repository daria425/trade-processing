"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import loginBackground from "../../assets/login-bg.jpg";

const signUpFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
});

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

function SignUpForm({
  signup,
  handleAuthSuccess,
}: {
  signup: (
    email: string,

    username: string,
    password: string
  ) => Promise<void>;
  handleAuthSuccess: () => void;
}) {
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  // 2. Define a submit handler.
  async function onSignup(values: z.infer<typeof signUpFormSchema>) {
    const { username, password, email } = values;
    try {
      console.log("Signing up with:", {
        username,
        password,
        email,
      });
      await signup(email, username, password);
      handleAuthSuccess();
    } catch (error) {
      console.error("Error during signup:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSignup)}
        className="space-y-8 max-w-md"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Sign up</Button>
      </form>
    </Form>
  );
}

function LoginForm({
  handleAuthSuccess,
  login,
}: {
  handleAuthSuccess: () => void;
  login: (email: string, password: string) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onLogin(values: z.infer<typeof loginFormSchema>) {
    const { email, password } = values;
    await login(email, password);
    // redirect or navigate after login
    handleAuthSuccess();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onLogin)}
        className="space-y-8 max-w-md"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Login</Button>
      </form>
    </Form>
  );
}

export function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleAuthSuccess = () => {
    navigate("/app");
  };
  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:block w-1/2 h-full">
        <img
          src={loginBackground}
          alt="Login Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h1>
            <div className="flex justify-center text-sm">
              <p className="text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                {isLogin ? "Sign up here" : "Login"}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            {isLogin ? (
              <LoginForm login={login} handleAuthSuccess={handleAuthSuccess} />
            ) : (
              <SignUpForm
                signup={signup}
                handleAuthSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
