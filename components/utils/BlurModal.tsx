"use client";

import React, { useEffect, useRef } from "react";
import { Noise, NoiseContent } from "react-noise";
import "react-noise/css";
import Icon from "./Icon";
import { Button } from "./Button";

export default function BlurModal({
    settings, header, body, footer, isOpen, updateOpen
} : {
    settings?: {
        placement?: "center" | "auto" | "top" | "top-center" | "bottom" | "bottom-center" | undefined, 
        size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full" | undefined,
        isDismissable?: boolean,
        hideCloseButton?: boolean,
    },
    header?: React.ReactNode | React.ReactNode[],
    body?: React.ReactNode | React.ReactNode[],
    footer?: React.ReactNode | React.ReactNode[],
    isOpen: boolean,
    updateOpen: (isOpen: boolean) => void,
}) {
    const { isOpen: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose, onOpenChange } = useDisclosure()
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if(isOpen) {
            internalOnOpen();
        } else {
            internalOnClose();
        }
    }, [isOpen, internalOnOpen, internalOnClose])

    return (
        <Modal
            isOpen={internalIsOpen}
            placement={settings?.placement}
            size={settings?.size}
            isDismissable={settings?.isDismissable || true}
            isKeyboardDismissDisabled={settings?.isDismissable || false}
            hideCloseButton={true}
            onClose={() => { internalOnClose(); updateOpen(false) }}
            onOpenChange={onOpenChange}
            backdrop="blur"
            classNames={{
                base: "bg-content1/50 backdrop-blur-xl",
                body: "bg-transparent"
            }}
        >
            <ModalContent>
                <Noise opacity={100} className="w-full noise h-fit relative min-h-max" >
                    <NoiseContent className="w-full noise-content h-full justify-normal min-h-max ">
                        <div ref={contentRef} className="h-full min-h-max w-full flex flex-col overflow-visible">
                            {header && 
                            <ModalHeader className="flex flex-row items-center justify-between w-full">
                                {header}
                                {!settings?.hideCloseButton && <Button onClick={() => {internalOnClose(); updateOpen(false) }} variant="light" color="danger" isIconOnly><Icon filled>close</Icon></Button>}
                            </ModalHeader>
                            }
                            {body && <ModalBody>{body}</ModalBody>}
                            {footer && <ModalFooter className=" max-sm:pb-8 ">{footer}</ModalFooter>}
                        </div>
                    </NoiseContent>
                </Noise>
            </ModalContent>
        </Modal>
        
    )
}