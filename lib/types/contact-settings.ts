export interface ContactSettings {
  title: string;
  address: string;
  addressNote: string;
  phone: string;
  phoneNote: string;
  email: string;
  hours: string;
  hoursNote: string;
  whatsappPhone: string;
  whatsappMessage: string;
  whatsappLabel: string;
}

export interface PublicContactSettings extends ContactSettings {
  phoneHref: string;
  emailHref: string;
  whatsappHref: string;
}
