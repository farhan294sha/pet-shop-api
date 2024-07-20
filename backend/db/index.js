import mongoose from "mongoose";
const { Schema } = mongoose;
import env from "dotenv";
env.config();

mongoose.connect(
  process.env.MONGODB_CONNECTION_URL || "mongodb://localhost:27017/pet-adoption"
);

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["Adopter", "Rehomer"],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  photoUrl: String,
  onlineStatus: {
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: Date,
  },
});

const adoptionUserDetailsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    town: { type: String, required: true },
    pinCode: { type: Number, required: true },
    mobileOrTelephone: { type: String, required: true },
  },
  above18: { type: Boolean, required: true },
  livingSituation: {
    type: String,
    enum: ["rented", "own", "other"],
    required: true,
  },
  gardenavailable: { type: Boolean, required: true },
  houseHoldSiting: {
    type: String,
    enum: ["rural", "town", "city"],
    required: true,
  },
  activityLevel: {
    type: String,
    enum: ["quiet", "normal", "loud"],
    required: true,
  },
  homeImage: [{ type: String, required: true }],
  noOfAdults: { type: Number, required: true },
  noOfChildren: { type: Number, required: true },
  anyVisitingChildren: [
    {
      age: { type: Number },
    },
  ],
  anyoneAllergyToPets: { type: Boolean, required: true },
  anotherAnimal: {
    nurtured: { type: Boolean }, // if the animal is nurtured
    vaccinated: { type: Boolean }, // if the animal is vaccinated in the last 12 months
    type: { type: String }, // type of animal
  },
  lifestylePatterns: { type: String, required: true, maxlength: 200 },
  planningToMoveIn6Months: { type: Boolean, required: true },
  anyHolidayNext3Months: { type: Boolean, required: true },
  suitableTransportForAnimal: { type: Boolean, required: true },
  describeExperienceWithAnimals: { type: String, required: true },
});

const petSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  species: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  characteristics: {
    type: String,
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "adopted", "approved"],
      message: "{VALUE} is not supported",
    },
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date().toISOString(),
  },
  breed: {
    type: String,
  },
  donorId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },
  size: {
    type: String,
  },
  rehome_reasons: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  color: String,
  photoUrl: String,
});

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isApproved: { type: Boolean, default: false },
  lastMessageAt: { type: Date, default: Date.now },
});

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachments: {
    urls: [String],
    photos: [String],
    documents: [String],
  },
  status: {
    sent: { type: Date, default: Date.now },
    delivered: { type: Date },
    read: { type: Date },
  },
  sentAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const petFeaturesSchema = new Schema({
  description: {
    type: String,
    maxlength: 250,
  },
  petId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Pet",
  },
  liveWithChild: {
    type: Boolean,
    default: false,
  },
  microchipped: {
    type: Boolean,
    default: false,
  },
  houseTrained: {
    type: Boolean,
    default: false,
  },
  hasBehaviouralIssues: {
    type: Boolean,
    default: false,
  },
  canWiveWithDogs: {
    type: Boolean,
    default: false,
  },
  shotsUpToDate: {
    type: Boolean,
    default: false,
  },
  liveWithCats: {
    type: Boolean,
    default: false,
  },
  spayedorNeutered: {
    type: Boolean,
    default: false,
  },
});

const reportSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reportType: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["resolved", "rejected"],
    required: true,
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: "Pet",
    required: true,
  },
  reportContext: {
    type: String,
  },
});

const adoptionDetailsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: "Pet",
    required: true,
  },
  reportId: {
    type: Schema.Types.ObjectId,
    ref: "Report",
    required: true,
  },
  donorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

// Method to generate a hash from plain text
userSchema.methods.createHash = async function (plainTextPassword) {
  // Hashing user's salt and password with 10 iterations,
  const saltRounds = 10;

  // First method to generate a salt and then create hash
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);

  // Second mehtod - Or we can create salt and hash in a single method also
  // return await bcrypt.hash(plainTextPassword, saltRounds);
};

// Validating the candidate password with stored hash and hash function
userSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

const AdoptionUserDetails = mongoose.model(
  "AdoptionUserDetails",
  adoptionUserDetailsSchema
);
const AdoptionDetails = mongoose.model(
  "AdoptionDetails",
  adoptionDetailsSchema
);
const Report = mongoose.model("Report", reportSchema);
const PetFeatures = mongoose.model("PetFeatures", petFeaturesSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);
const User = mongoose.model("User", userSchema);
const Pet = mongoose.model("Pet", petSchema);

export {
  User,
  Pet,
  Conversation,
  Message,
  PetFeatures,
  Report,
  AdoptionDetails,
  AdoptionUserDetails,
};
