const TeamMember = require("../../Model/teamMember");
const TeamMemberTitle = require("../../Model/teamTitle");
const leavesModel = require("../../Model/leaves");
const Booking = require("../../Model/booking");
const Branch = require("../../Model/branchLocation");
const businessModel = require("../../Model/business");
const functions = require("../../../functions");
const bcrypt = require("bcryptjs");
const auth = require("../../Middleware/auth");
const jwt = require("jsonwebtoken");
const oneHourMiliSec = 3600000


const teamMembers = {
    addTeamTitle: async (req, res) => {
        try {
            const existingteamTitle = await TeamMemberTitle.findOne(
                {
                    teamTitle: req.body.teamTitle,
                    businessId: req.body.businessId
                }
            );
            if (existingteamTitle) {
                return res.status(400).json({
                    status: false,
                    message: "Team title already exists",
                });
            } else {
                const latest = await TeamMemberTitle.findOne({ businessId: req.body.businessId }, { titleID: 1 }).sort({ _id: -1 });
                // const format = 'TEAM'
                let count;
                if (latest) {
                    count = Number((latest?.titleID).slice(-3));
                } else {
                    count = 0;
                }
                let titleID = (String(count + 1).padStart(3, '0'));

                const payload = {
                    businessId: req.body.businessId,
                    branchId: req.body.branchId,
                    countryId: req.body.countryId,
                    titleID: titleID,
                    teamTitle: req.body.teamTitle,
                    updatedBy: req.user.firstName + ' ' + req.user.lastName,
                    createdBy: req.user.firstName + ' ' + req.user.lastName,
                };

                const data = await new TeamMemberTitle(payload).save();
                if (data) {
                    res.status(201).json({
                        status: true,
                        message: "Team title added successfully",
                        data: data,
                    });
                }
            }

        } catch (error) {
            throw error;
        }
    },
    updateTeamTitle: async (req, res) => {
        try {
            const { id } = req.params;
            req.body.updatedBy = req.user.firstName + ' ' + req.user.lastName;
            TeamMemberTitle.findByIdAndUpdate(
                id, req.body, { new: true }, ((err, data) => {
                    if (err) throw err;
                    return res.status(200).json({
                        status: true,
                        message: "Team title updated successfully",
                        data: data,
                    });
                })
            );
        } catch (error) {
            throw error;
        }
    },
    deleteTeamTitle: async (req, res) => {
        try {
            const { id } = req.params; // Extract team member ID from URL
            const deletedTeamMember = await TeamMemberTitle.findByIdAndDelete(id);

            if (!deletedTeamMember) {
                res.status(404).json({
                    status: false,
                    message: "Team members not found successfully",
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: "Team member deleted successfully",
                });
            }
        } catch (error) {
            res.status(400).json({
                status: false,
                message: "Something went wrong",
                error: error.message,
            });
        }
    },
    teamTitleStatus: async (req, res) => {
        try {
            const upload = await functions.statusUpdate(req.params.id, TeamMemberTitle);
            res.json(upload);
        } catch (err) {
            throw err;
        }
    },
    getTeamTitle: async (req, res) => {
        try {
            let { businessId, _id, type } = req.query
            let query = { status: true };
            if (type) {
                query = {};
            }

            if (_id) {
                query._id = _id
            }
            if (businessId) {
                query.businessId = businessId
            }

            const teamMembers = await TeamMemberTitle.find(query)
                .sort({ _id: -1 })
                .populate(
                    {
                        path: "businessId",
                        model: "business",
                        select: { businessName: 1, country: 1 }
                    }
                );
            return res.status(200).json({
                status: true,
                message: "Team title found successfully",
                data: teamMembers,
            });
        } catch (error) {
            throw error;
        }
    },
    addTeamMember: async (req, res) => {
        try {
            const teamMember = await TeamMember.findOne({
                email: req.body.email
            });
            if (teamMember) {
                return res.status(400).json({
                    status: false,
                    message: "Team members already exist with this email",
                });
            } else {
                // const latest = await TeamMember.findOne(
                //     { businessId: req.body?.businessId },
                //     { teamMemberIdNo: 1 }).sort({ _id: -1 }
                //     )

                // let count;
                // if (latest?.teamMemberIdNo) {
                //     count = +latest.teamMemberIdNo;
                // } else {
                //     count = 0;
                // }

                const latest = await businessModel.findByIdAndUpdate(
                    { _id: req.body.businessId },
                    { $inc: { teamCount: 1 } },
                    { new: true },
                );

                req.body.teamMemberIdNo = String(latest?.teamCount).padStart(4, '0')
                req.body.teamMemberIdNo = req.body.teamMemberIdNo
                console.log("ttttttttttttttttttttt", req.body.teamMemberIdNo)

                if (req.file) {
                    req.body.image = req.file.location;
                }
                if (req.body.serviceId) {
                    req.body.serviceId = JSON.parse(req.body.serviceId);
                }
                if (req.body.Role) {
                    req.body.Role = JSON.parse(req.body.Role);

                    req.body.Role.map(async roles => {
                        if (roles.branch == 'global') {
                            delete roles.branch
                            roles.isGlobal = true
                        }
                    })
                }
                if (req.body.hoursDetail) {
                    req.body.hoursDetail = JSON.parse(req.body.hoursDetail);
                }

                //Creating default password
                const hashedPassword = await bcrypt.hash("123456", 10);

                req.body.password = hashedPassword;
                req.body.userType = 'teamMember'
                req.body.updatedBy = req.user.firstName + ' ' + req.user.lastName;
                req.body.createdBy = req.user.firstName + ' ' + req.user.lastName;

                const newTeamMember = new TeamMember(req.body);
                newTeamMember.save(async (err, data) => {
                    if (err) throw err;

                    // const resetLink = `${process.env.domain}/business/resetPassword/${data._id}`;
                    // const payload = {
                    //     templateId: 57,
                    //     email: email,
                    //     resetLink: resetLink,
                    // };

                    // await functions.sendEmail(payload, (data, error) => {
                    //     if (error) throw error.message
                    //     console.log(`Email send successfully\n${JSON.stringify(data)}`)
                    //     res.status(201).json({
                    //         status: true,
                    //         message: "Team member added successfully",
                    //         data: data,
                    //     });
                    // })

                    res.status(201).json({
                        status: true,
                        message: "Team member added successfully",
                        data: data,
                    });
                });
            }
        } catch (error) {
            throw error;
        }
    },
    updateTeamMember: async (req, res) => {
        try {
            const { id } = req.params;

            let check = true;
            let conflicts;

            req.body.image = req?.file?.location;
            req.body.updatedBy = req.user.firstName + ' ' + req.user.lastName;

            if (req.body.serviceId) {
                req.body.serviceId = JSON.parse(req.body.serviceId)
            }
            if (req.body.branchId) {
                req.body.branchId = JSON.parse(req.body.branchId)
            }
            if (req.body.Role) {
                req.body.Role = JSON.parse(req.body.Role)

                req.body.Role.map(async roles => {
                    if (roles.branch == 'global') {
                        delete roles.branch
                        roles.isGlobal = true
                    }
                })
            }
            if (req.body.hoursDetail) {
                req.body.hoursDetail = JSON.parse(req.body.hoursDetail)

                let { status, conflict } = functions.checkBranchHours(req.body.hoursDetail)
                check = status
                conflicts = conflict

                console.log("tttttttttttttttttttttttttttttt", status, conflict)
            }

            if (check) {
                TeamMember.findByIdAndUpdate(
                    id, req.body, { new: true },
                    (err, data) => {
                        if (err) throw err;
                        res.status(200).json({
                            status: true,
                            message: "Team member updated successfully",
                            data: data,
                        });
                    }
                );
            } else {
                res.status(200).json({
                    status: false,
                    message: "A team member cannot have the same working hours in multiple branchs",
                    conflicts
                });
            }
        } catch (error) {
            throw error;
        }
    },
    deleteTeamMember: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedTeam = TeamMember.findByIdAndDelete(id)
            const deletedLeaves = leavesModel.deleteMany({ teamMemberId: id });

            const [team, service] = await Promise.all([deletedTeam, deletedLeaves])

            res.status(200).json({
                status: true,
                message: "Team member deleted successfully",
                data: team
            });
        } catch (error) {
            throw error;
        }
    },
    getAllTeamMembers: async (req, res) => {
        try {
            let { businessId, branchId, serviceId, _id } = req.query;
            let query = { status: true };
            let leaveData;

            if (_id) {
                query._id = ObjectId(_id)
                leaveData = await leavesModel.find({ teamMemberId: _id })
                    .populate({ path: 'leaves.branchId', select: { branchName: 1 } })
            }
            if (businessId) {
                query.businessId = ObjectId(businessId);
            }
            if (branchId) {
                query.branchId = ObjectId(branchId);
            }
            if (serviceId) {
                query.serviceId = ObjectId(serviceId);
            }

            const teamMember = await TeamMember.find(query).sort({ _id: -1 })
                .populate([
                    {
                        path: "branchId",
                        select: { branchName: 1 }
                    },
                    {
                        path: "serviceId",
                        populate: {
                            path: 'serviceCatagoryId',
                            model: 'serviceCatagory',
                        }
                    },
                    {
                        path: "hoursDetail.branchId",
                        select: { branchName: 1 }
                    },
                    {
                        path: "Role.branch",
                        select: { branchName: 1 }
                    },
                    {
                        path: "Role.role",
                        select: { teamTitle: 1 }
                    },
                ]);

            const branches = await Branch.find(query).select({ _id: 1, branchName: 1 })
            await Promise.all(teamMember.map(async (team) => {
                let newRole = [];

                for (const roles of team.Role) {
                    if (roles.isGlobal) {
                        roles.branches = branches
                        newRole.push(roles);
                    } else {
                        newRole.push(roles);
                    }
                }

                team.Role = newRole;
            }));


            return res.status(200).json({
                status: true,
                message: "Team members found successfully",
                data: teamMember,
                leaveData: leaveData,
            });
        } catch (error) {
            throw error;
        }
    },
    // getTeamMembersBooking: async (req, res) => {
    //     try {
    //         const { branchId, date, bookingStatus } = req.query;

    //         let query = { branchId: ObjectId(branchId) }

    //         if (bookingStatus) {
    //             query.bookingStatus = bookingStatus;
    //         }
    //         if (date) {
    //             query.salectDate = date;
    //         }

    //         const requestedDay = functions.getRequestedDayName(date)
    //         const projection = [
    //             {
    //                 path: 'services.serviceId',
    //                 select: { duration: 1, serviceId: 1, _id: 1, duration: 1, seasonType: 1, seasonPrice: 1, seasonPrice: 1, createdAt: 1 },
    //                 populate: {
    //                     path: 'serviceId',
    //                     select: { amenitiesId: 1, serviceName: 1, _id: 1, createdAt: 1 },
    //                 },
    //             },
    //             {
    //                 path: 'services.TeamMemberId',
    //                 select: { _id: 1, serviceId: 1, serviceId: 1, firstName: 1, lastName: 1, image: 1, Role: 1 },
    //             },
    //             {
    //                 path: 'services.amenitiesId',
    //                 select: { _id: 1, itemName: 1 }
    //             },
    //             {
    //                 path: 'services.promotionId',
    //                 select: { _id: 1, promotionName: 1, minimumPurchaseAmount: 1 }
    //             },
    //             {
    //                 path: 'services.packageId',
    //                 select: { PackageName: 1, Services: 1, _id: 1, finalPrice: 1, totalPrice: 1, typeOfService: 1 },
    //                 populate: {
    //                     path: 'Services.priceId',
    //                     model: 'businessPrice',
    //                     select: { duration: 1, serviceId: 1, _id: 1, duration: 1, seasonType: 1, seasonPrice: 1, seasonPrice: 1, createdAt: 1 },
    //                     populate: {
    //                         path: 'serviceId',
    //                         model: 'businessService',
    //                         select: { amenitiesId: 1, serviceName: 1, _id: 1, createdAt: 1 },
    //                     }
    //                 }
    //             },
    //             {
    //                 path: 'clientId',
    //             }
    //         ]

    //         const booking = await Booking.find(query)
    //             .populate(projection)
    //             .select({ status: 0, isActive: 0, updatedBy: 0, updatedAt: 0 })

    //         const unAssigned = []
    //         booking.map(book => {
    //             let check = true
    //             book.services.map(service => {
    //                 if (service?.TeamMemberId?.length === 0) {
    //                     check = false
    //                 }
    //             })
    //             if (!check) {
    //                 unAssigned.push(book)
    //             }
    //         })

    //         const teamMembers = await TeamMember.find({ branchId, status: true })
    //             .select({ _id: 1, serviceId: 1, businessId: 1, firstName: 1, lastName: 1, image: 1, Role: 1, bookingDetails: 1, hoursDetail: 1, availablity: 1, createdAt: 1 })

    //         await Promise.all(teamMembers.map(async (teamMember) => {
    //             // getting hours details of particular team member on a particular day
    //             let availablity = await functions.TeamMemberAvailablity(teamMember?.hoursDetail, branchId, requestedDay)

    //             // checking leave on requested day
    //             const allLeaves = await leavesModel.findOne({ teamMemberId: teamMember._id, 'leaves.branchId': branchId });

    //             if (allLeaves) {
    //                 for (const leave of allLeaves.leaves) {
    //                     const dateRange = await functions.getDatesFromRange(new Date(leave?.fromDate), new Date(leave?.toDate));

    //                     for (const leaveDate of dateRange) {
    //                         if (leaveDate === date) {

    //                             if (leave?.fromTime && leave?.toTime) {
    //                                 console.log("sssssssssssssssssss", leave?.fromTime, leave?.toTime)
    //                                 const { hours, minutes } = functions.getTimeDifference(leave?.fromTime, leave?.toTime);
    //                                 const availabilityHours = +availablity.split(': ')[1]
    //                                 const diff = availabilityHours - hours + minutes

    //                                 console.log("ttttttttttttttttttttttttt", hours, minutes, availabilityHours, diff)
    //                                 availablity = `Daily hrs: ${diff}`

    //                             } else {
    //                                 availablity = 'Not available'
    //                             }
    //                         }
    //                     }
    //                 }
    //             }


    //             teamMember.availablity = availablity;

    //             //getting team member bookings
    //             query['services.TeamMemberId'] = teamMember._id
    //             const booking = await Booking.find(query)
    //                 .populate(projection)
    //                 .select({ status: 0, isActive: 0, updatedBy: 0, updatedAt: 0 })

    //             const filtered = booking.map(book => {
    //                 const filteredd = book?.services.filter(service => {
    //                     return service?.TeamMemberId[0]?._id.toString() == teamMember._id.toString()
    //                 })
    //                 book.services = filteredd
    //                 return book;
    //             })
    //             teamMember.bookingDetails = filtered
    //         }))

    //         // teamMember

    //         return res.status(200).json({
    //             status: true,
    //             message: `Team member booking fetched successfully`,
    //             assigned: teamMembers,
    //             unAssigned
    //         });
    //     } catch (error) {
    //         throw error;
    //     }
    // },
    getTeamMembersBooking: async (req, res) => {
        try {
            const { branchId, date, bookingStatus, teamMemberId, startDate, endDate } = req.query;

            let query = { branchId: ObjectId(branchId) }

            if (bookingStatus) {
                query.bookingStatus = bookingStatus;
            }

            const projection = functions.bookingProjection()
            let teamQuery = { branchId, status: true }

            const unAssigned = []
            if (teamMemberId) {
                // query.salectDate = startDate;
                query.salectDateInFormat = { $gte: startDate, $lte: endDate }

                const booking = await Booking.find(query)
                    .populate(projection)
                    .select({ status: 0, isActive: 0, updatedBy: 0, updatedAt: 0 })

                booking.map(book => {
                    let check = true
                    book.services.map(service => {
                        if (service?.TeamMemberId?.length === 0) {
                            check = false
                        }
                    })
                    if (!check) {
                        unAssigned.push(book)
                    }
                })

                teamQuery._id = teamMemberId
            } else {
                teamQuery['services.TeamMemberId'] = teamMemberId
            }

            const teamMembers = await TeamMember.find(teamQuery)
                .select({ _id: 1, serviceId: 1, businessId: 1, firstName: 1, lastName: 1, image: 1, Role: 1, bookingDetails: 1, hoursDetail: 1, availablity: 1, createdAt: 1 })


            await Promise.all(teamMembers.map(async (teamMember) => {
                // console.log("33333333333333333333333", dateRange)

                let availablity;

                if (teamMemberId) {
                    const requestedDay = functions.getRequestedDayName(startDate)
                    // getting hours details of particular team member on a particular day
                    availablity = await functions.TeamMemberAvailablity(teamMember?.hoursDetail, branchId, requestedDay)

                    // checking leave on requested day
                    const allLeaves = await leavesModel.findOne({ teamMemberId: teamMember._id, 'leaves.branchId': branchId });

                    if (allLeaves) {
                        for (const leave of allLeaves.leaves) {
                            const dateRange = await functions.getDatesFromRange(new Date(leave?.fromDate), new Date(leave?.toDate));

                            for (const leaveDate of dateRange) {
                                if (leaveDate === date) {

                                    if (leave?.fromTime && leave?.toTime) {
                                        // console.log("sssssssssssssssssss", leave?.fromTime, leave?.toTime)
                                        const { hours, minutes } = functions.getTimeDifference(leave?.fromTime, leave?.toTime);
                                        const availabilityHours = +availablity.split(': ')[1]
                                        const diff = availabilityHours - hours + minutes

                                        // console.log("ttttttttttttttttttttttttt", hours, minutes, availabilityHours, diff)
                                        availablity = `Daily hrs: ${diff}`

                                    } else {
                                        availablity = 'Not available'
                                    }
                                }
                            }
                        }
                    }

                } else {

                    const dateRange = await functions.getDatesFromRange(new Date(startDate), new Date(endDate));

                    availablity = await functions.TeamMemberAvailablityForRange(teamMember?._id, teamMember?.hoursDetail, branchId, dateRange)

                    availablity = `Daily hrs: ${availablity}`
                }


                teamMember.availablity = availablity;

                //getting team member bookings
                query['services.TeamMemberId'] = teamMember._id
                const booking = await Booking.find(query)
                    .populate(projection)
                    .select({ status: 0, isActive: 0, updatedBy: 0, updatedAt: 0 })

                // const filtered = booking.map(book => {
                //     if (new Date(book?.salectDate) >= new Date(startDate) && new Date(book?.salectDate) <= new Date(endDate)) {

                //         const filteredd = book?.services.filter(service => {
                //             return service?.TeamMemberId[0]?._id.toString() == teamMember._id.toString()
                //         })
                //         book.services = filteredd
                //     }
                //     return book;
                // })

                // teamMember.bookingDetails = filtered

                teamMember.bookingDetails = booking?.map(book => {
                    // if (new Date(book?.salectDate) >= new Date(startDate) && new Date(book?.salectDate) <= new Date(endDate)) {
                        book.services = book?.services.filter(service => service?.TeamMemberId[0]?._id.toString() == teamMember._id.toString());
                    // }
                    return book;
                });
            }))

            return res.status(200).json({
                status: true,
                message: `Team member booking fetched successfully`,
                assigned: teamMembers,
                unAssigned
            });
        } catch (error) {
            throw error;
        }
    },
    getAvailableTeamMember: async (req, res) => {
        try {
            const { businessId, branchId, bookingDate, bookingTime, newBookingDuration, startTime, bookingId } = req.query;

            const conflictArray = []
            const available = []
            const requestedDay = functions.getRequestedDayName(bookingDate)

            const allTeam = await TeamMember
                .find({ businessId: ObjectId(businessId), isActive: true, })
                .populate('serviceId')
                .select({ firstName: 1, lastName: 1, serviceId: 1, hoursDetail: 1 })

            if (allTeam?.length > 0) {
                for (const teamMember of allTeam) {
                    let leaveCheck = true;
                    let generalAvailablityCheck = false;
                    let existingBookingCheck = true;

                    const allLeaves = await leavesModel.findOne({ teamMemberId: teamMember._id, 'leaves.branchId': branchId });

                    if (allLeaves) {

                        for (const leave of allLeaves.leaves) {
                            const dateRange = await functions.getDatesFromRange(new Date(leave?.fromDate), new Date(leave?.toDate));

                            for (const date of dateRange) {

                                if (date === bookingDate) {

                                    if (leave?.fromTime && leave?.toTime) {
                                        const check = functions.isBookingWithinLeaveRange(leave?.fromTime, leave?.toTime, bookingTime)

                                        if (check) {
                                            leaveCheck = false;
                                        }
                                    } else {
                                        leaveCheck = false;
                                    }

                                    if (!leaveCheck) {

                                        let conflict = {
                                            teamMembernName: `${teamMember.firstName} ${teamMember.lastName}`,
                                            teamMemberId: teamMember._id,
                                            leaveId: leave._id,
                                            message: "Please check team member's existing leaves",
                                        };
                                        conflictArray.push(conflict);
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    if (leaveCheck) {
                        const availablityArray = await functions.TeamMemberAvailablity(teamMember?.hoursDetail, branchId, requestedDay, true);

                        if (Array.isArray(availablityArray)) {
                            const bookingDateTime = new Date(bookingDate.concat("T", bookingTime, ":00.000Z")).getTime();

                            for (const obj of availablityArray) {
                                const availablityFrom = new Date(bookingDate.concat("T", obj.from, ":00.000Z")).getTime();
                                const availablityTo = new Date(bookingDate.concat("T", obj.to, ":00.000Z")).getTime();

                                if (bookingDateTime >= availablityFrom && bookingDateTime <= availablityTo) {
                                    generalAvailablityCheck = true;
                                    break;
                                }
                            }

                            if (generalAvailablityCheck) {
                                let existingBooking = await functions.checkExistingBooking(bookingDate, bookingTime, newBookingDuration, teamMember, startTime)
                                if (bookingId) {
                                    existingBooking = await functions.checkExistingBooking(bookingDate, bookingTime, newBookingDuration, teamMember, startTime, bookingId)
                                }
                                existingBookingCheck = existingBooking?.existingBookingCheck

                                console.log("33333333333333333333333333333", existingBooking)

                                if (existingBookingCheck) {
                                    const reducedObj = {
                                        _id: teamMember._id,
                                        firstName: teamMember.firstName,
                                        lastName: teamMember.lastName,
                                        serviceId: teamMember.serviceId,
                                    }
                                    available.push(reducedObj);
                                } else {
                                    conflictArray.push(existingBooking?.conflict);
                                }
                            } else {
                                let conflict = {
                                    teamMembernName: `${teamMember.firstName} ${teamMember.lastName}`,
                                    teamMemberId: teamMember._id,
                                    message: "Please check team member's general availability",
                                };
                                conflictArray.push(conflict);
                            }
                        }
                    }
                }
            }

            return res.status(200).json({
                status: true,
                message: `Available Team members fetched successfully`,
                data: available,
                conflictArray,
            });
        } catch (error) {
            throw error;
        }
    },
    getTeamMembersCalender: async (req, res) => {
        try {
            let { branchId, teamMemberId, startDate, endDate, bookingStatus } = req.query;

            let query = { branchId: ObjectId(branchId) }

            if (teamMemberId) {
                query['services.TeamMemberId'] = ObjectId(teamMemberId)
            }
            if (bookingStatus) {
                query.status = bookingStatus;
            }
            if (startDate && endDate) {
                query.salectDateInFormat = { $gte: new Date(startDate), $lte: new Date(endDate) }
            }

            const bookings = await Booking.aggregate([
                { $unwind: '$services' },
                { $match: query },
                {
                    $lookup: {
                        from: 'businessprices',
                        localField: 'services.serviceId',
                        foreignField: 'serviceId',
                        as: 'services.serviceId',
                    },
                },
            ])

            let totalminutes = 0
            let totalBooking = 0

            await Promise.all(bookings.map(async (booking) => {
                const serviceDuration = booking?.services?.serviceId[0].duration?.split(' ')[0]
                totalminutes += +serviceDuration;
                totalBooking++;
            }))

            const teamMember = await TeamMember.findOne({ _id: teamMemberId }).select('hoursDetail')
            let generalTotalhours = 0
            let generalTotalminutes = 0

            teamMember?.hoursDetail?.map(hourDetail => {
                if (hourDetail?.branchId.toString() === branchId.toString()) {
                    if (hourDetail?.shift?.length > 0) {
                        hourDetail.shift.map(shift => {

                            if (shift?.workingHours?.length > 0) {
                                shift.workingHours.map(workingHour => {
                                    const { hours, minutes } = functions.getTimeDifference(workingHour?.from, workingHour?.to);
                                    generalTotalhours += hours;
                                    generalTotalminutes += minutes;
                                })
                            }
                        })
                    }
                }
            });

            //multipling with 30 to get monthly generalWorkingHours
            const generalWorkingHours = (((generalTotalhours * 60) + generalTotalminutes) / 60) * 30
            const workedHours = totalminutes / 60

            let freeHours;
            if (generalWorkingHours > workedHours) {
                freeHours = generalWorkingHours - workedHours
            } else {
                freeHours = 0
            }

            let bookingData = await Booking.find(query).sort({ _id: -1 })
                .populate('businessId')
                .populate('countryId')
                .populate('branchId')
                .populate('clientId')
                .populate('services.serviceId')
                .populate('services.TeamMemberId')
                .populate('services.amenitiesId')

            const allData = {
                totalHours: +generalWorkingHours.toFixed(2) || 0,
                workedHours: +workedHours.toFixed(2) || 0,
                freeHours: +freeHours.toFixed(2) || 0,
                totalBooking: +totalBooking || 0,
                bookings: bookingData,
            }

            return res.status(200).json({
                status: true,
                message: `Team member calender details fetched successfully`,
                data: allData,
            });
        } catch (error) {
            throw error;
        }
    },
    viewBookingHistory: async (req, res) => {
        try {
            const { branchId, clientId, teamMemberId } = req.query;

            let query = { branchId: ObjectId(branchId) }

            if (clientId) {
                query.clientId = clientId;
            }
            if (teamMemberId) {
                query['services.TeamMemberId'] = ObjectId(teamMemberId)
            }

            const bookings = await Booking.find(query)

            return res.status(200).json({
                status: true,
                message: `Client booking history fetched successfully`,
                data: bookings,
            });
        } catch (error) {
            throw error;
        }
    },
    assignTeamToBooking: async (req, res) => {
        try {
            let { bookingId, services } = req.body

            //assigning team members to branch
            const data = await Booking.findByIdAndUpdate(
                { _id: bookingId },
                { $set: { services } },
                { new: true },
            )

            res.status(200).json({
                status: true,
                message: "Booking assigned to team member successfully",
                data: data
            });
        } catch (error) {
            throw error;
        }
    },
    uploadTeamMembers: async (req, res) => {
        try {
            const { businessId, branchId } = req.query
            let columnToKey = {
                A: 'firstName',
                B: 'lastName',
                C: 'nickName',
                D: 'email',
                E: 'mobile',
                F: 'isPublic',
                G: 'isBooking',
                H: 'state',
                I: 'image',
                J: 'imageVisibleToPublic',
            }

            let newData = functions.excelToJsonData(req.file.path, columnToKey)
            //Deleting uploaded excel
            const filePath = path.join(__dirname + `/../../../public/${req.file.filename}`)
            fs.unlinkSync(filePath)

            if (newData) {
                const filterdNewData = functions.checkMissingValues(columnToKey, newData?.sheet1)
                newData = filterdNewData.valid
                const invalid = filterdNewData.invalid

                const oldData = await TeamMember.find({}).select('email mobile')

                const duplicateEmails = []
                const uniqueData = []

                newData?.map(neww => {
                    let check;
                    let unique;

                    if (oldData.length > 0) {
                        oldData.map(old => {
                            if (old.email == neww.email) {
                                check = true
                            } else {
                                unique = neww
                            }
                        });
                    } else {
                        unique = neww
                    }

                    if (check) {
                        duplicateEmails.push(neww.email);
                    } else if (unique) {
                        unique.businessId = businessId
                        unique.branchId = branchId
                        unique.isPublic = neww.isPublic.toLowerCase()
                        unique.isBooking = neww.isBooking.toLowerCase()
                        unique.imageVisibleToPublic = neww.imageVisibleToPublic.toLowerCase()
                        unique.isActive = true
                        unique.status = true
                        unique.createdBy = req.user.firstName + ' ' + req.user.lastName
                        unique.updatedBy = req.user.firstName + ' ' + req.user.lastName
                        uniqueData.push(unique);
                    }
                })

                if (uniqueData.length > 0) {
                    await TeamMember.insertMany(uniqueData)
                }
                return res.status(200).json({
                    status: true,
                    message: 'File uploaded and data saved to the database.',
                    duplicateEmails: duplicateEmails,
                    invalidData: invalid
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Did not find any data in excel.',
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error processing the file.' });
        }
    },
};
exports.teamMembers = teamMembers;
