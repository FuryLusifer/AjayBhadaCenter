import { Music, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-muted-foreground"><a href ="https://www.google.com/maps/place/Ajay+Bhada+Center/@27.4311863,85.0312695,17z/data=!4m15!1m8!3m7!1s0x39eb490012e0f235:0x5459d038f4108f6d!2sAjay+Bhada+Center!8m2!3d27.431307!4d85.031312!10e5!16s%2Fg%2F11mkdzdghm!3m5!1s0x39eb490012e0f235:0x5459d038f4108f6d!8m2!3d27.431307!4d85.031312!16s%2Fg%2F11mkdzdghm!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MTAyMi4wIKXMDSoASAFQAw%3D%3D">Raptiroad, Hetauda-1, Makawanpur</a></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Phone/Whatsapp</p>
                <p className="text-muted-foreground"><a href="https://wa.me/+9779763776991" target="_blank">+977 9763776991</a></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Music className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Tiktok</p>
                <p className="text-muted-foreground"><a href="https://www.tiktok.com/@ajay.bhada.center">@ajay.bhada.center</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;