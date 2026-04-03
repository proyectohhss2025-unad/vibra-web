import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    classSize?: string;
    zIndex?: number;
}

const ModalForgotPass: React.FC<ModalProps> = ({ isOpen, onClose, children, classSize = 'max-w-md', zIndex = 300 }) => {

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog defaultOpen={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Está seguro de que ha olvidado su contraseña?</DialogTitle>
                    <DialogDescription>
                        Esta acción no recupera su contraseña actual; en su lugar, genera una nueva que será enviada a su correo registrado en el sistema.
                    </DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default ModalForgotPass;