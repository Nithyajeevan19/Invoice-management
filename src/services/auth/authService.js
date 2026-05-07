/*
import { supabase } from "../../lib/supabase";

export const signUp = async (email, password) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const resetPasswordForEmail = async (email) => {
  const redirectTo = window.location.origin;
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
};

export const updatePassword = async (newPassword) => {
  return await supabase.auth.updateUser({
    password: newPassword,
  });
};
*/

// Mock exports to prevent breakages
export const signUp = async () => ({ data: {}, error: null });
export const signIn = async () => ({ data: {}, error: null });
export const signOut = async () => ({ error: null });
export const getCurrentUser = async () => ({ data: { user: {} }, error: null });
export const resetPasswordForEmail = async () => ({ data: {}, error: null });
export const updatePassword = async () => ({ data: {}, error: null });