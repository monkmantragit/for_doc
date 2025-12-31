'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
// Import necessary Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Use DialogClose for cancel button
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SurgeonDetailsEditor from '@/components/admin/SurgeonDetailsEditor';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  image?: string;
  isActive?: boolean;
}

interface FormData {
  name: string;
  speciality: string;
  fee: string;
  image: string;
  isActive: boolean;
}

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  onSuccess: () => void;
}

export default function DoctorModal({ isOpen, onClose, doctor, onSuccess }: DoctorModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    speciality: '',
    fee: '',
    image: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && doctor) {
      setFormData({
        name: doctor.name,
        speciality: doctor.speciality,
        fee: doctor.fee.toString(),
        image: doctor.image || '',
        isActive: doctor.isActive !== undefined ? doctor.isActive : true,
      });
    } else if (isOpen && !doctor) {
      // Reset form when opening for Add
      setFormData({
        name: '',
        speciality: '',
        fee: '',
        image: '',
        isActive: true,
      });
    }
  }, [isOpen, doctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fee = parseFloat(formData.fee);
      if (isNaN(fee)) {
        toast.error("Please enter a valid fee amount");
        setIsSubmitting(false);
        return;
      }

      const endpoint = doctor ? `/api/admin/doctors/${doctor.id}` : '/api/admin/doctors'; // Use correct PUT endpoint
      const method = doctor ? 'PUT' : 'POST';

      // Ensure isActive is a boolean, not a string
      const payload = {
        ...formData,
        fee: fee,
        isActive: Boolean(formData.isActive),
        ...(doctor && { id: doctor.id }) // Include ID for PUT requests (needed for validation)
      };

      console.log(`Submitting ${method} to ${endpoint} with payload:`, payload);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || 'Failed to save doctor');
      }

      toast.success(`Doctor ${doctor ? 'updated' : 'added'} successfully`);
      onSuccess(); // Call onSuccess passed from parent
      onClose(); // Close modal
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${doctor ? 'update' : 'add'} doctor`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use Dialog open prop and onOpenChange for controlled state
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {doctor ? 'Edit Doctor' : 'Add New Doctor'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {doctor ? 'Update the doctor\'s information.' : 'Enter the details for the new doctor.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value="basic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Doctor Information</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]"
                    required
                    placeholder="Enter doctor's name"
                  />
                </div>

                {/* Speciality */}
                <div className="space-y-2">
                  <Label htmlFor="speciality" className="text-sm font-medium text-gray-700">
                    Speciality
                  </Label>
                  <Select
                    value={formData.speciality}
                    onValueChange={(value) => setFormData({ ...formData, speciality: value })}
                  >
                    <SelectTrigger className="h-10 border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]">
                      <SelectValue placeholder="Select a speciality" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Sports Shoulder Clinic">Sports Shoulder Clinic</SelectItem>
                      <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                      <SelectItem value="Sports Psychologist">Sports Psychologist</SelectItem>
                      <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                      <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                      <SelectItem value="Neurologist">Neurologist</SelectItem>
                      <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the doctor's primary specialty
                  </p>
                </div>

                {/* Consultation Fee */}
                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-sm font-medium text-gray-700">
                    Fee (₹)
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    className="h-10 border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]"
                    required
                    min="0"
                    placeholder="e.g., 1000"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                    Image URL (Optional)
                  </Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="h-10 border-gray-300 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Active Status Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active Status
                    </Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="data-[state=checked]:bg-[#8B5C9E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.isActive
                      ? "Doctor is currently active and will appear in booking options."
                      : "Doctor is inactive and won't appear in booking options."
                    }
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} className="bg-[#8B5C9E] hover:bg-[#7A4F8B] text-white">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {doctor ? 'Save Changes' : 'Add Doctor'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}