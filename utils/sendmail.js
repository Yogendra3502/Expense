const nodemailer = require("nodemailer")
exports.sendMail = function(email,user,res,req) {
    const token = Math.floor(1000 + Math.random() * 9000);
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "yogendrabana@gmail.com",
            pass: "bgvvfakjoxbfbflm",
        },
    });

    const mailOptions = {
        from:" yogendra pvt Pvt. Ltd.<Yogendrabana8962@gmail.com>",
        to: email,
        subject: "Password Reset Token",
        html: `<h1>${token}</h1>`,
    };

    transport.sendMail(mailOptions, async (err, info) => {
        if (err) return res.send(err);

        user.token = token;
        await user.save();

        res.render("verify", { rohit: req.user, id: user._id });
    });
}