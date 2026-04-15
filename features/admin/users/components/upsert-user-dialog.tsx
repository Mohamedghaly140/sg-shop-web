"use client";

import { useActionState, useEffect, useState } from "react";
import { LucidePlus } from "lucide-react";
import type { Value as PhoneValue } from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Form from "@/components/shared/form/form";
import FormControl from "@/components/shared/form-control";
import { PhoneInput } from "@/components/shared/phone-input";
import FieldError from "@/components/shared/form/field-error";
import SubmitButton from "@/components/shared/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { createUserAction, updateUserAction } from "../actions/users.actions";
import type { User } from "@/generated/prisma/client";

const ROLES = ["USER", "MANAGER", "ADMIN"] as const;

type UpsertUserDialogProps =
  | { mode: "create"; trigger?: React.ReactNode }
  | { mode: "edit"; user: Pick<User, "id" | "name" | "email" | "phone" | "role" | "active">; trigger?: React.ReactNode };

export function UpsertUserDialog(props: UpsertUserDialogProps) {
  const [open, setOpen] = useState(false);
  const user = props.mode === "edit" ? props.user : null;
  const [isActive, setIsActive] = useState(user?.active ?? true);
  const [phone, setPhone] = useState<PhoneValue>("" as PhoneValue);

  const action = props.mode === "create" ? createUserAction : updateUserAction;
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  useEffect(() => {
    if (actionState.status === "ERROR" && actionState.payload?.phone) {
      setPhone(actionState.payload.phone as PhoneValue);
    }
  }, [actionState.timestamp]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPhone("" as PhoneValue);
          setIsActive(user?.active ?? true);
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        {props.trigger ?? (
          <Button size="sm">
            <LucidePlus className="w-4 h-4" />
            New User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Create User" : "Edit User"}
          </DialogTitle>
        </DialogHeader>

        <Form
          action={formAction}
          actionState={actionState}
          onSuccess={() => setOpen(false)}
        >
          {user && <input type="hidden" name="userId" value={user.id} />}

          {props.mode === "create" && (
            <>
              <FormControl
                label="Full Name"
                name="name"
                placeholder="Jane Doe"
                actionState={actionState}
                defaultValue={actionState.payload?.name ?? user?.name ?? ""}
              />
              <FormControl
                label="Email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                actionState={actionState}
                defaultValue={actionState.payload?.email ?? user?.email ?? ""}
              />
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="phone">Phone</Label>
                <input type="hidden" name="phone" value={phone} />
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={setPhone}
                  international={true}
                  defaultCountry="EG"
                  placeholder="+20 100 000 0000"
                  defaultValue={actionState.payload?.phone ?? user?.phone ?? ""}
                />
                <FieldError actionState={actionState} name="phone" />
              </div>
              <FormControl
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                actionState={actionState}
                defaultValue=""
              />
            </>
          )}

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={user?.role ?? "USER"}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError actionState={actionState} name="role" />
          </div>

          {props.mode === "edit" && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive users cannot sign in
                </p>
              </div>
              <input type="hidden" name="active" value={isActive.toString()} />
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

          <SubmitButton
            label={props.mode === "create" ? "Create User" : "Save Changes"}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
