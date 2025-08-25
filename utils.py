import qrcode
import os

def generate_qr_code(data, filepath):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    img.save(filepath)
