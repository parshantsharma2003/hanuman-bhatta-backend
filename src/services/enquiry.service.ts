import Enquiry, { EnquiryDocument } from '../models/Enquiry';

export interface CreateEnquiryInput {
  name: string;
  phone: string;
  message: string;
}

export const createEnquiry = async (
  input: CreateEnquiryInput
): Promise<EnquiryDocument> => {
  return Enquiry.create({
    name: input.name,
    phone: input.phone,
    message: input.message,
  });
};
