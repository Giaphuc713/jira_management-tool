require("module-alias/register");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("@/models/user");
const Project = require("@/models/project");
const Issue = require("@/models/issue");
const Comment = require("@/models/comment");

async function runSeed() {
  await mongoose.connect(process.env.MONGO_URL);

  const userData = [];
  for (let i = 1; i <= 30; i++) {
    const number = String(i).padStart(2, "0");
    userData.push({
      email: `phucha${number}@example.com`,
      displayName: `User ${number}`,
      isActive: true,
    });
  }

  const emails = userData.map((user) => user.email);
  const projectKeys = [
    "APIA",
    "APIB",
    "APIC",
    "ADMA",
    "ADMB",
    "ECOMA",
    "ECOMB",
    "PAYA",
    "PAYB",
    "INTA",
  ];

  const existingProjects = await Project.find({
    key: { $in: projectKeys },
  }).select("_id");
  const projectIds = existingProjects.map((project) => project._id);
  const existingIssues = await Issue.find({
    projectId: { $in: projectIds },
  }).select("_id");
  const issueIds = existingIssues.map((issue) => issue._id);

  const deletedComments = await Comment.deleteMany({
    issueId: { $in: issueIds },
  });
  const deletedIssues = await Issue.deleteMany({
    projectId: { $in: projectIds },
  });
  const deletedProjects = await Project.deleteMany({
    _id: { $in: projectIds },
  });
  const deletedUsers = await User.deleteMany({ email: { $in: emails } });

  const addedUsers = await User.insertMany(userData);

  const projectData = [];
  for (let i = 0; i < projectKeys.length; i++) {
    const key = projectKeys[i];
    projectData.push({
      key,
      name: `Project ${key}`,
      description: "",
      members: [
        { userId: addedUsers[i % addedUsers.length]._id, role: "Admin" },
        {
          userId: addedUsers[(i + 1) % addedUsers.length]._id,
          role: "Member",
        },
      ],
    });
  }
  const addedProjects = await Project.insertMany(projectData);

  console.log("Seed smoke reset and insert complete:", {
    deletedUsers: deletedUsers.deletedCount,
    deletedProjects: deletedProjects.deletedCount,
    deletedIssues: deletedIssues.deletedCount,
    deletedComments: deletedComments.deletedCount,
    addedUsers: addedUsers.length,
    addedProjects: addedProjects.length,
  });

  await mongoose.disconnect();
}

module.exports = { runSeed };
