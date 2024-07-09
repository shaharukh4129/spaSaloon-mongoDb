const axios = require('axios')
//send in blue requirements
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.send_in_blue_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const randomstring = require("randomstring");
const assignRole = require('./src/Model/assignRole')
const Membership = require('./src/Model/membership')
const Promotion = require('./src/Model/promotion')
const Client = require('./src/Model/client')
const booking = require('./src/Model/booking')
const leavesModel = require("./src/Model/leaves");
const excelToJson = require('convert-excel-to-json');
const moment = require('moment');
const oneHourMiliSec = 3600000
const businessCounterModel = require("./src/Model/businessCounter")


// const config = require("./config.js").config;
aws.config.update({
    "accessKeyId": process.env.accessKeyId,
    "secretAccessKey": process.env.secretAccessKey,
    "region": process.env.region,
});
var s3 = new aws.S3();

exports.sendOtp = (mobile) => {
    try {
        const otp = generateOtp2()

        let payload = JSON.stringify({
            "ID": process.env.smsId,
            "Password": process.env.smsPassword,
            "Mobile": +mobile,
            "Type": "AUTO",
            "Message": 'Your OTP is  \n' + otp
        });

        axios({
            method: 'post',
            url: 'https://www.commzgate.net/gateway/SendMessage',
            headers: {
                'Content-Type': 'application/json'
            },
            data: payload
        })
        return otp;
    } catch (err) {
        throw err
    }
}
exports.applyMembershipToClient = async (businessId, clien) => {
    try {
        const memberships = await Membership.find({ businessId, achievement_Membership: true }).sort({ tier: -1 })

        let allEligibleMemberships = []

        const existingBooking = await booking.find({
            businessId,
            clientId: clien._id,
        }).populate("services.serviceId")


        await Promise.all(memberships?.map(async membership => {

            let criteriaStartDate;
            let criteriaExpiryDate;
            const unit = +membership?.criteriaUnit
            const frequency = membership?.criteriaFrequency

            if (membership?.criteria === 'After customer registration') {

                criteriaStartDate = new Date(clien.createdAt)
                let date = new Date(criteriaStartDate)

                if (frequency === 'Month') {
                    criteriaExpiryDate = new Date(date.setMonth(date.getMonth() + unit))

                } else if (frequency === 'Year') {
                    criteriaExpiryDate = new Date(date.setYear(date.getYear() + unit))

                } else if (frequency === 'Week') {
                    criteriaExpiryDate = new Date(date.setDate(date.getDate() + unit * 7))

                }


            } else if (membership?.criteria === 'After signup of membership') {

                criteriaStartDate = new Date(clien?.membershipStartDate)
                let date = new Date(criteriaStartDate)

                if (frequency === 'Month') {
                    criteriaExpiryDate = new Date(date.setMonth(date.getMonth() + unit))

                } else if (frequency === 'Year') {
                    criteriaExpiryDate = new Date(date.setYear(date.getYear() + unit))

                } else if (frequency === 'Week') {
                    criteriaExpiryDate = new Date(date.setDate(date.getDate() + unit * 7))

                }


            } else if (membership?.criteria === 'From Date') {

                criteriaStartDate = new Date(membership?.criteriaStart)
                const date = new Date(criteriaStartDate)

                if (frequency === 'Month') {
                    criteriaExpiryDate = new Date(date.setMonth(date.getMonth() + unit))

                } else if (frequency === 'Year') {
                    criteriaExpiryDate = new Date(date.setYear(date.getYear() + unit))

                } else if (frequency === 'Week') {
                    criteriaExpiryDate = new Date(date.setDate(date.getDate() + unit * 7))

                }

            } else if (membership?.criteria === 'Start of current calender year') {

                const currentCalenderYear = new Date().getFullYear()
                criteriaStartDate = new Date(`${currentCalenderYear}-01-01T00:00:00.000Z`)
                const date = new Date(criteriaStartDate)

                if (frequency === 'Month') {
                    criteriaExpiryDate = new Date(date.setMonth(date.getMonth() + unit))

                } else if (frequency === 'Year') {
                    criteriaExpiryDate = new Date(date.setYear(date.getYear() + unit))

                } else if (frequency === 'Week') {
                    criteriaExpiryDate = new Date(date.setDate(date.getDate() + unit * 7))

                }
            }




            // Getting client's existing booking data
            let totalAmount = 0
            let noOfBooking = 0
            let hoursOfBooking = 0

            await Promise.all(existingBooking?.map(async booking => {
                let bookingDate = new Date(booking?.salectDateInFormat)
                // console.log("ssssssssssssssssssssssssssss", bookingDate, criteriaStartDate, criteriaExpiryDate)

                if (bookingDate >= criteriaStartDate && bookingDate <= criteriaExpiryDate) {
                    totalAmount += +booking?.finalPrice || 0

                    hoursOfBooking += await getClientBookingDuration2(booking?.services)
                    // console.log("ttttttttttttttttttttt", hoursOfBooking)

                    noOfBooking++;
                }
            }))

            // considering 2 points is equal to 1 rs
            let noOfPoints = totalAmount / 2

            // console.log("ttttttttttttttttttttt", totalAmount, hoursOfBooking, noOfBooking, noOfPoints)

            // Comparing client booking data with criteria to check eligability to become member
            let check;
            if (+membership?.amountSpent >= totalAmount) {
                check = true;

            } else if (+membership?.hoursBooked >= hoursOfBooking) {
                check = true;

            } else if (+membership?.Points >= noOfPoints) {
                check = true;
            }

            if (check) {
                allEligibleMemberships.push(membership)
            }
        }))


        const eligibleMembership = allEligibleMemberships[0]

        let membershipStartDate = new Date(new Date().toISOString().split('T')[0])
        let membershipExpiryDate;
        let date = new Date(membershipStartDate)

        if (eligibleMembership?.ValidityFrequency === 'Month') {
            membershipExpiryDate = new Date(date.setMonth(date.getMonth() + eligibleMembership?.ValidityUnit))

        } else if (eligibleMembership?.ValidityFrequency === 'Year') {
            membershipExpiryDate = new Date(date.setYear(date.getYear() + eligibleMembership?.ValidityUnit))

        }

        if (eligibleMembership?.Membership != clien?.Membership) {
            const payload = {
                Membership: eligibleMembership?.Membership,
                membershipStartDate,
                membershipExpiryDate
            }

            const membershipHistory = {
                Membership: clien?.Membership,
                membershipStartDate: clien?.membershipStartDate,
                membershipExpiryDate: clien?.membershipExpiryDate
            }

            await Client.findOneAndUpdate(
                { _id: clien._id },
                {
                    $set: payload,
                    $push: { membershipHistory }
                }
            )
        }

    } catch (err) {
        throw err
    }
}
const generateOtp2 = () => {
    try {
        return randomstring.generate({
            length: 4,
            charset: "numeric",
        });
    } catch (err) {
        throw err
    }
}
exports.generateOtp = generateOtp2
exports.sendEmail = async (params, callBack) => {
    try {
        sendSmtpEmail = {
            to: [{ email: params.email }],
            templateId: params.templateId,
            params,
            headers: {
                'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
            }
        };
        // if (params.CCemail) {
        //     sendSmtpEmail.cc = params.CCemail
        // }
        // if (params.BCCemail) {
        //     sendSmtpEmail.bcc = params.BCCemail
        // }
        apiInstance.sendTransacEmail(sendSmtpEmail).then(callBack)
    } catch (err) {
        throw err
    }
}
exports.Multer = (bucketName, fileSize) => {
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: bucketName,
            contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set the content type
            acl: 'public-read', // Set the appropriate ACL
            metadata: (req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (req, file, cb) => {
                console.log(file);
                cb(null, Date.now().toString() + "-" + file.originalname);
            },
        }),
        // limits: { fileSize }, // In bytes: 2000000 bytes = 2 MB
    });
}
exports.Svg = async (buffer, originalname) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: 'spa-saloon-images',
            Key: 'business/images/' + originalname, // Set the desired S3 path and filename
            Body: buffer,
            ContentType: 'image/svg+xml', // Set the desired Content-Type
        };
        s3.upload(params, (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
exports.statusUpdate = async (userid, modelName) => {
    try {
        const user = await modelName.findOne({ _id: userid });
        if (user) {
            let newStatus;
            if (user.status == true) {
                newStatus = false
            } else {
                newStatus = true
            }
            const data = await modelName.findByIdAndUpdate({ _id: userid }, { $set: { status: newStatus } }, { new: true }
            );
            const message = newStatus ? "Active" : "Deactive";
            return { message, status: true, data: data };
        } else {
            return { message: "No user Found", status: false };
        }
    } catch (err) {
        return { message: "No user Found", status: false };
    }
}
exports.localMulter = () => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/')
        },
        filename: function (req, file, cb) {
            let newName = Date.now() + '-' + file.originalname
            cb(null, newName);
        }
    })
}
exports.checkBranchHours = (hoursDetail) => {

    let newDuration = []
    hoursDetail?.map(newHoursObj => {
        newHoursObj?.shift?.map(shift => {
            shift?.workingHours?.map(hours => {
                let payload = {
                    _id: hours?._id,
                    day: hours?.day,
                    from: hours?.from,
                    to: hours?.to,
                }

                if (hours?.from && hours?.to) {
                    newDuration.push(payload)
                }
            })
        })
    })

    console.log("tfffffffffffff", newDuration)

    let check = { status: true };

    newDuration?.map(currObj => {
        const currObjFrom = new Date(`2000-01-01T${currObj?.from}`);
        const currObjEnd = new Date(`2000-01-01T${currObj?.to}`);

        for (let each of newDuration) {

            const eachObjFrom = new Date(`2000-01-01T${each?.from}`);
            const eachObjEnd = new Date(`2000-01-01T${each?.to}`);

            if (each?.day === currObj?.day && each?._id != currObj?._id) {

                if (
                    ((currObjFrom >= eachObjFrom && currObjFrom < eachObjEnd) || (currObjEnd > eachObjFrom && currObjEnd < eachObjEnd) || (currObjFrom <= eachObjFrom && currObjEnd > eachObjEnd)) ||
                    ((eachObjFrom >= currObjFrom && eachObjFrom < currObjEnd) || (eachObjEnd > currObjFrom && eachObjEnd < currObjEnd) || (eachObjFrom <= currObjFrom && eachObjEnd > currObjEnd))
                ) {
                    check.status = false
                    check.conflict = currObj
                    break;
                }
            }
        }
    })
    return check;
}
exports.excelToJsonData = (path, data) => {
    try {
        const result = excelToJson({
            sourceFile: path,
            header: { rows: 1 },
            columnToKey: data
        });
        return result;
    } catch (err) {
        throw err
    }
}
exports.isBookingWithinLeaveRange = (leaveFromTime, leaveToTime, bookingTime) => {
    try {
        const format = 'HH:mm';
        const bookingMoment = moment(bookingTime, format);
        const leaveFromMoment = moment(leaveFromTime, format);
        const leaveToMoment = moment(leaveToTime, format);

        return bookingMoment.isBetween(leaveFromMoment, leaveToMoment) ||
            bookingMoment.isSame(leaveFromMoment) ||
            bookingMoment.isSame(leaveToMoment);
    } catch (err) {
        throw err
    }
}
exports.checkMissingValues = (columnToKey, newArray) => {
    try {
        let validArray = [];
        let inValidArray = [];

        for (const xyz of newArray) {
            let hasAllValues = true;

            for (const key in columnToKey) {
                if (columnToKey.hasOwnProperty(key)) {
                    const objectKey = columnToKey[key];
                    if (!xyz.hasOwnProperty(objectKey)) {
                        hasAllValues = false;
                        break;
                    }
                }
            }

            if (hasAllValues) {
                validArray.push(xyz);
            } else {
                inValidArray.push(xyz);
            }
        }

        return {
            valid: validArray,
            invalid: inValidArray,
        };
    } catch (err) {
        throw err;
    }
};
exports.createCustomNumber = async (model, id, customNumber) => {
    try {
        const latest = await model.findOne({ id }, { customNumber: 1 }).sort({ _id: -1 });
        let number;
        if (latest?.customNumber) {
            number = (+latest[customNumber] + 1)
        } else {
            number = 2001001
        }
        return number;
    } catch (err) {
        throw err;
    }
};
const getTimeDifference2 = (time1, time2) => {
    // Split the time values into hours and minutes
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    // Calculate the total minutes for each time
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    // Calculate the absolute difference in minutes
    const differenceMinutes = Math.abs(totalMinutes1 - totalMinutes2);

    // Calculate the hours and minutes for the difference
    const hoursDifference = Math.floor(differenceMinutes / 60);
    const minutesDifference = differenceMinutes % 60;

    return {
        hours: hoursDifference || 0,
        minutes: minutesDifference || 0,
    }
}
exports.getTimeDifference = getTimeDifference2
let TeamMemberAvailablity2 = async (hoursDetails, branchId, requestedDay, filter) => {
    try {
        let availablity = 0;
        let availablityArray = []

        if (hoursDetails?.length > 0) {
            hoursDetails.map(hourDetail => {

                if (hourDetail?.branchId.toString() === branchId.toString()) {
                    if (hourDetail?.shift?.length > 0) {
                        let totalhours = 0
                        let totalminutes = 0
                        hourDetail.shift.map(shift => {
                            // console.log("aaaaaaaaaaaaaaaaaaaaaaaa", shift)

                            if (shift?.workingHours?.length > 0) {
                                shift.workingHours.map(workingHour => {

                                    let dayMatched;
                                    if (workingHour.day === requestedDay) {
                                        dayMatched = true
                                    }
                                    if (dayMatched) {
                                        if (filter) {
                                            const availablity = {
                                                from: workingHour?.from,
                                                to: workingHour?.to
                                            }
                                            availablityArray.push(availablity)

                                        } else {
                                            let { hours, minutes } = getTimeDifference2(workingHour?.from, workingHour?.to);
                                            // console.log("tttttttttttttttttttttt", hours, minutes)
                                            totalhours += hours;
                                            totalminutes += minutes;
                                        }

                                    } else {
                                        availablity = 'Not available';
                                    }
                                });
                            } else {
                                availablity = 'Not available';
                            }
                        });

                        const workedHours = ((totalhours * 60) + totalminutes) / 60
                        availablity = `Daily hrs: ${workedHours.toFixed(2)}`
                    } else {
                        availablity = 'Not available';
                    }
                } else {
                    availablity = 'Not available';
                }
            });
        } else {
            availablity = 'Not available';
        }

        if (filter) {
            return availablityArray;
        } else {
            return availablity;
        }
    } catch (err) {
        throw err;
    }
};
exports.TeamMemberAvailablityForRange = async (teammemberId, hoursDetails, branchId, dateRange) => {
    try {
        let totalhours = 0
        let totalminutes = 0

        // checking leave on requested day
        const allLeaves = await leavesModel.findOne({ teamMemberId: teammemberId, 'leaves.branchId': branchId });

        // for (const date of dateRange) {
        await Promise.all(dateRange?.map(async date => {
            if (allLeaves) {

                // for (const leave of allLeaves.leaves) {
                await Promise.all(allLeaves?.leaves?.map(async leave => {

                    const leaveDateRange = await functions.getDatesFromRange(new Date(leave?.fromDate), new Date(leave?.toDate));

                    for (const leaveDate of leaveDateRange) {
                        if (leaveDate === date) {

                            if (leave?.fromTime && leave?.toTime) {

                                const { totalHours, totalMinutes } = await getAvailableHours(date, hoursDetails, branchId)

                                // console.log("tttttttttttttttttttttttttttt", totalHours, totalMinutes)

                                const { leaveHours, leaveMinutes } = functions.getTimeDifference(leave?.fromTime, leave?.toTime);
                                // console.log("ssssssssssssssssssssssssssss", leaveHours, leaveMinutes)

                                totalhours += +totalHours - +leaveHours
                                totalminutes += +totalMinutes - +leaveMinutes

                            }

                        } else {

                            const { totalHours, totalMinutes } = await getAvailableHours(date, hoursDetails, branchId)
                            // console.log("ppppppppppppppppppppppppppppp", totalHours, totalMinutes)

                            totalhours += +totalHours
                            totalminutes += +totalMinutes
                        }
                    }
                }))
                // }

            } else {
                let { totalHours, totalMinutes } = await getAvailableHours(date, hoursDetails, branchId)

                // console.log("ppppppppppppppppppppppppppppp", totalHours, totalMinutes)


                totalhours += +totalHours
                totalminutes += +totalMinutes
            }
        }))
        // }
        // console.log("ppppppppppppppppppppppppppppp", totalhours, totalminutes)

        return ((+totalhours * 60) + +totalminutes) / 60

    } catch (err) {
        throw err;
    }
};
const getAvailableHours = async (date, hoursDetails, branchId) => {
    try {
        let totalhours = 0
        let totalminutes = 0

        const requestedDay = getRequestedDayName2(date)

        if (hoursDetails?.length > 0) {
            await Promise.all(hoursDetails.map(async hourDetail => {

                if (hourDetail?.branchId.toString() === branchId.toString()) {
                    if (hourDetail?.shift?.length > 0) {

                        await Promise.all(hourDetail.shift.map(shift => {

                            if (shift?.workingHours?.length > 0) {
                                shift.workingHours.map(workingHour => {

                                    if (workingHour.day === requestedDay) {

                                        let { hours, minutes } = getTimeDifference2(workingHour?.from, workingHour?.to);
                                        // console.log("tttttttttttttttttt", hours, minutes)
                                        totalhours += hours;
                                        totalminutes += minutes;
                                    }
                                });
                            }
                        }));
                    }
                }
            }))
        }

        return { totalHours: totalhours || 0, totalMinutes: totalminutes || 0 }

    } catch (err) {
        throw err;
    }
};
exports.TeamMemberAvailablity = TeamMemberAvailablity2

const getClientBookingDuration2 = async (services) => {
    try {
        let duration = 0
        await Promise.all(services?.map(service => {
            const min = service?.serviceId?.duration?.split(' ')[0]
            duration += +min || 0
        }))
        return duration
    } catch (err) {
        throw err;
    }
};
exports.getClientBookingDuration = getClientBookingDuration2

exports.checkExistingBooking = async (bookingDate, bookingTime, newBookingDuration, teamMember, salectTime, bookingId) => {
    try {
        let existingBookingCheck = true
        let conflict;

        let query = {
            'services.TeamMemberId': teamMember._id,
            bookingStatus: 'Upcoming',
            salectDate: bookingDate
        }
        if (bookingId) {
            query._id = { $ne: bookingId }
        }
        const bookings = await booking.find(query).populate('services.serviceId');

        if (bookings?.length > 0) {
            for (const book of bookings) {

                for (const subBooking of book?.services) {

                    console.log("qqqqqqqqqqqqqqqqqqqqqqqqq", subBooking?.TeamMemberId?.includes(teamMember._id))
                    if (subBooking?.TeamMemberId?.includes(teamMember._id)) {

                        const existingBookingFrom = new Date(book?.salectDate?.concat("T", subBooking?.startTime, ":00.000Z"));
                        const bookingDuration = subBooking?.serviceId?.duration?.split(' ')[0]
                        // const existingBookingTo = new Date(book?.salectDate?.concat("T", subBooking?.endTime, ":00.000Z"));
                        const existingBookingTo = new Date(existingBookingFrom.getTime() + (bookingDuration * oneHourMiliSec / 60));

                        const newBookingTimeFrom = new Date(bookingDate.concat("T", salectTime || bookingTime, ":00.000Z"));
                        const newBookingTimeTo = new Date(newBookingTimeFrom.getTime() + (+newBookingDuration * oneHourMiliSec / 60));

                        console.log("ssssssssssssssssssssss", existingBookingFrom, existingBookingTo, newBookingTimeFrom, newBookingTimeTo)
                        if (
                            (existingBookingFrom >= newBookingTimeFrom && existingBookingFrom < newBookingTimeTo) ||
                            (existingBookingTo > newBookingTimeFrom && existingBookingTo < newBookingTimeTo) ||
                            (newBookingTimeFrom <= existingBookingFrom && newBookingTimeTo >= existingBookingTo)
                        ) {
                            existingBookingCheck = false;
                            conflict = {
                                teamMembernName: teamMember.firstName + ' ' + teamMember.lastName,
                                teamMemberId: teamMember._id,
                                bookingId: book._id,
                                message: "Please check team member's existing booking",
                            };
                            break;
                        }

                    }
                }
            }
        }
        return {
            existingBookingCheck, conflict
        }
    } catch (err) {
        throw err;
    }
};

exports.checkPromotionEligibility = async (services, businessId, clientId) => {
    try {
        let isPromotionEligible = true
        let conflict;

        services.map(async service => {
            if (service?.promotionId) {

                const existingBooking = await booking.find({
                    businessId,
                    clientId,
                    'services.promotionId': service?.promotionId
                })
                const promotionDetails = await Promotion.findOne({ _id: service?.promotionId })

                // Getting redeem count on a particular client basis
                let promotionRedeemedCount = 0
                await Promise.all(existingBooking.map(async booking => {
                    booking?.services?.map(async servi => {
                        if (service?.promotionId?.toString() === servi?.promotionId?.toString())
                            promotionRedeemedCount++;
                    })
                }))

                if (promotionDetails?.LimitUsePerClient) {
                    if (+promotionRedeemedCount >= +promotionDetails?.LimitUsePerClient) {
                        isPromotionEligible = false
                        conflict = {
                            _id: service?.promotionId,
                            limit: promotionDetails?.LimitUsePerClient,
                            promotionRedeemedCount,
                        }
                    }
                }

                // managing promotion total redeem count
                if (isPromotionEligible) {
                    await Promotion.findByIdAndUpdate(
                        service.promotionId,
                        { $inc: { redeemCount: 1 } },
                    );
                }
            }
        })
        return {
            isPromotionEligible, conflict
        }
    } catch (err) {
        throw err;
    }
};

const getRequestedDayName2 = (bookingDate) => {
    try {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let requestedDay = new Date(bookingDate).getDay();
        return daysOfWeek[requestedDay];

    } catch (err) {
        throw err;
    }
};
exports.getRequestedDayName = getRequestedDayName2

exports.createBusinessUserId = async () => {
    try {
        const check = await businessCounterModel.findOne();
        let latest;
        if (check) {
            latest = await businessCounterModel.findByIdAndUpdate(
                { _id: check._id },
                { $inc: { businessUserCount: 1 } },
                { new: true }
            );
        } else {
            const payload = {
                businessUserCount: 2001001,
                businessCount: 11000
            }
            latest = await new businessCounterModel(payload).save()
        }
        return +latest?.businessUserCount
    } catch (err) {
        throw err;
    }
};
exports.createBusinessId = async () => {
    try {
        let check = await businessCounterModel.findOne()

        let latest;
        if (check) {
            latest = await businessCounterModel.findByIdAndUpdate(
                { _id: check._id },
                { $inc: { businessCount: 1 } },
                { new: true }
            );
        }
        return +latest?.businessCount
    } catch (err) {
        throw err;
    }
};
exports.getDatesFromRange = async (fromDate, toDate) => {
    try {
        const datesArray = [];
        while (fromDate <= toDate) {
            datesArray.push(fromDate.toISOString().split('T')[0]);
            fromDate.setDate(fromDate.getDate() + 1);
        }
        return datesArray;
    } catch (err) {
        throw err
    }
}
exports.bookingProjection = () => {
    try {
        return [
            {
                path: 'services.serviceId',
                select: { duration: 1, serviceId: 1, _id: 1, duration: 1, seasonType: 1, seasonPrice: 1, seasonPrice: 1, createdAt: 1 },
                populate: {
                    path: 'serviceId',
                    select: { amenitiesId: 1, serviceName: 1, _id: 1, createdAt: 1 },
                },
            },
            {
                path: 'services.TeamMemberId',
                select: { _id: 1, serviceId: 1, serviceId: 1, firstName: 1, lastName: 1, image: 1, Role: 1 },
            },
            {
                path: 'services.amenitiesId',
                select: { _id: 1, itemName: 1 },
                populate: {
                    path: 'itemName',
                    select: { _id: 1, itemName: 1 }
                }
            },
            {
                path: 'services.promotionId',
                select: { _id: 1, promotionName: 1, minimumPurchaseAmount: 1 }
            },
            {
                path: 'services.packageId',
                select: { PackageName: 1, Services: 1, _id: 1, finalPrice: 1, totalPrice: 1, typeOfService: 1 },
                populate: {
                    path: 'Services.priceId',
                    model: 'businessPrice',
                    select: { duration: 1, serviceId: 1, _id: 1, duration: 1, seasonType: 1, seasonPrice: 1, seasonPrice: 1, createdAt: 1 },
                    populate: {
                        path: 'serviceId',
                        model: 'businessService',
                        select: { amenitiesId: 1, serviceName: 1, _id: 1, createdAt: 1 },
                    }
                }
            },
            {
                path: 'clientId',
            }
        ]
    } catch (err) {
        throw err
    }
}





