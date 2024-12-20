import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'kathlyn.dach3@ethereal.email',
        pass: 'egp4yjRkg1GGzBp5RK'
    }
});

const sendVerificationEmail = async(user,code)=>{

    const mailOptions = {
        from: 'jobportalapi@mail.com.com',
        to: user.email,
        subject: 'Verify Your Email',
        text: `Your verification code is ${code}. It is valid for 10 minutes.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export {sendVerificationEmail}