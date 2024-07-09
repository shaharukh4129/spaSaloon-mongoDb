const TeamMember = require("../../Model/teamMember");
const functions = require("../../../functions");
exports.listteam = {
    list_team: async (req, res) => {
        try {
            TeamMember.find({}).select({ originalAssignServiceArray: 0 }).populate("businessId").populate([ { path: "serviceId", select: { serviceName: 1 } }, { path: "branchId", select: { branchName: 1 } }, { path: "Role.role", select: { teamTitle: 1 } } ]).sort({ _id: -1 }).exec((err, data) => {
                if (err) throw err
                return res.status(200).json({
                    status: true,
                    message: "Team members found successfully",
                    data: data,
                });
            });
        } catch (error) {
            throw error
        }
    },

    teamMemberStatus: async (req, res) => {
        try {
            const upload = await functions.statusUpdate(req.params.id, TeamMember);
            res.json(upload)
        } catch (err) {
            throw err
        }
    }

}