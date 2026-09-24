"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Gender } from "@/db/schema";
import { CreateActivityForm, type ActivityFormValues } from "./create-activity-form";

interface CreateActivitySheetProps {
  /** Lieu choisi sur la carte ; le tiroir est ouvert quand il est défini et `open` est vrai. */
  location: [number, number] | null;
  open: boolean;
  values: ActivityFormValues;
  onValuesChange: (values: ActivityFormValues) => void;
  onClose: () => void;
  onEditLocation: () => void;
  onCreated: (activityId: string) => void;
  creatorGender: Gender | null;
  /** Activité modifiée ; absent = création. */
  editingActivityId?: string | null;
}

/**
 * Tiroir de création d'activité (bas sur mobile, droite sur desktop).
 * Modal sur tous les écrans : un clic à côté ne doit pas faire perdre la saisie par erreur.
 */
export function CreateActivitySheet({
  location,
  open,
  values,
  onValuesChange,
  onClose,
  onEditLocation,
  onCreated,
  creatorGender,
  editingActivityId = null,
}: CreateActivitySheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Drawer
      open={open && location !== null}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      swipeDirection={isDesktop ? "right" : "down"}
      showSwipeHandle={!isDesktop}
    >
      <DrawerContent className="md:shadow-xl md:data-[swipe-axis=x]:top-16 md:data-[swipe-axis=x]:[--drawer-content-width:28rem]">
        <DrawerHeader className="flex-row items-start justify-between gap-3 text-left">
          <div className="space-y-1">
            <DrawerTitle className="text-lg font-semibold">
              {editingActivityId ? "Modifier l'activité" : "Nouvelle activité"}
            </DrawerTitle>
            <DrawerDescription className="text-left">
              {editingActivityId
                ? "Les participants seront prévenus des changements importants."
                : "Propose une session et trouve tes partenaires."}
            </DrawerDescription>
          </div>
          <DrawerClose render={<Button variant="ghost" size="icon-sm" aria-label="Fermer" className="-mt-1 -mr-2" />}>
            <X />
          </DrawerClose>
        </DrawerHeader>

        {location && (
          <CreateActivityForm
            location={location}
            values={values}
            onValuesChange={onValuesChange}
            onEditLocation={onEditLocation}
            onCreated={onCreated}
            creatorGender={creatorGender}
            editingActivityId={editingActivityId}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
