import { useAuth } from "@/store/useAuth";
import { useChats } from "@/store/useChats";

export function logoutAll() {
  useAuth.getState().logout();
  useChats.getState().reset();
}