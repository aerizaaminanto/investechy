import { Consultant } from "../models/index.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../services/b2Connect.js";

const getStorageBucket = () =>
  process.env.B2_BUCKET_NAME || process.env.B2_KEY_NAME;

const generateConsultantId = async () => {
  const consultants = await Consultant.find(
    { id: /^consultant-\d+$/ },
    { id: 1, _id: 0 }
  ).lean();

  const maxNumber = consultants.reduce((max, consultant) => {
    const match = consultant.id.match(/^consultant-(\d+)$/);
    if (!match) {
      return max;
    }

    return Math.max(max, Number(match[1]));
  }, 0);

  const nextNumber = String(maxNumber + 1).padStart(3, "0");
  return `consultant-${nextNumber}`;
};

const uploadConsultantPhoto = async (consultantId, file) => {
  const bucket = getStorageBucket();
  if (!bucket) {
    throw new Error("S3 bucket is not configured.");
  }

  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
  const photoStorageKey = `consultants/${consultantId}-${Date.now()}-${sanitizedName}`;
  const endpoint = String(process.env.B2_ENDPOINT || "").replace(/\/+$/, "");

  const uploadCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: photoStorageKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(uploadCommand);

  return {
    photoStorageKey,
    photoUrl: endpoint ? `${endpoint}/${bucket}/${photoStorageKey}` : photoStorageKey,
  };
};

const deleteConsultantPhoto = async (photoStorageKey) => {
  if (!photoStorageKey) {
    return;
  }
  const bucket = getStorageBucket();
  if (!bucket) {
    return;
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: photoStorageKey,
  });

  await s3Client.send(deleteCommand);
};

const normalizeConsultantPayload = (payload = {}) => {
  const normalizedSpesialisasi =
    payload.spesialisasi ??
    payload["spesialisasi[]"];

  return {
    ...payload,
    spesialisasi: Array.isArray(normalizedSpesialisasi)
      ? normalizedSpesialisasi
      : normalizedSpesialisasi !== undefined
        ? [normalizedSpesialisasi]
        : payload.spesialisasi,
  };
};

const validateConsultantPayload = (payload, { isUpdate = false } = {}) => {
  const errors = [];
  const { id, nama, spesialisasi, whatsapp, email, fee } = payload;

  if (!isUpdate || nama !== undefined) {
    if (typeof nama !== "string" || !nama.trim()) {
      errors.push("Field 'nama' wajib berupa string dan tidak boleh kosong.");
    }
  }

  if (!isUpdate || spesialisasi !== undefined) {
    const isValidSpesialisasi =
      Array.isArray(spesialisasi) &&
      spesialisasi.length > 0 &&
      spesialisasi.every((item) => typeof item === "string" && item.trim());

    if (!isValidSpesialisasi) {
      errors.push("Field 'spesialisasi' wajib berupa array string dan minimal berisi 1 item.");
    }
  }

  if (!isUpdate || whatsapp !== undefined) {
    if (typeof whatsapp !== "string" || !/^https:\/\/wa\.me\/\d+$/.test(whatsapp)) {
      errors.push("Field 'whatsapp' wajib berupa link wa.me yang valid, contoh: https://wa.me/6281234567890.");
    }
  }

  if (!isUpdate || email !== undefined) {
    if (typeof email !== "string" || !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Field 'email' wajib berupa link mailto yang valid, contoh: mailto:user@email.com.");
    }
  }

  if (!isUpdate || fee !== undefined) {
    if (
      fee === "" ||
      fee === null ||
      fee === undefined ||
      Number.isNaN(Number(fee)) ||
      Number(fee) < 0
    ) {
      errors.push("Field 'fee' wajib berupa angka dan tidak boleh negatif.");
    }
  }

  if (id !== undefined && (typeof id !== "string" || !id.trim())) {
    errors.push("Field 'id' harus berupa string jika dikirim.");
  }

  return errors;
};

const sanitizeConsultantPayload = async (payload, existingConsultant = null, { allowCustomId = true } = {}) => ({
  id:
    (allowCustomId ? payload.id?.trim() : null) ||
    existingConsultant?.id ||
    (await generateConsultantId()),
  nama: payload.nama?.trim() ?? existingConsultant?.nama,
  spesialisasi:
    payload.spesialisasi?.map((item) => item.trim()) ?? existingConsultant?.spesialisasi,
  whatsapp: payload.whatsapp?.trim() ?? existingConsultant?.whatsapp,
  email: payload.email?.trim() ?? existingConsultant?.email,
  fee:
    payload.fee !== undefined && payload.fee !== null && payload.fee !== ""
      ? Number(payload.fee)
      : existingConsultant?.fee,
  photoUrl: existingConsultant?.photoUrl ?? null,
  photoStorageKey: existingConsultant?.photoStorageKey ?? null,
});

const getConsultants = async (req, res, next) => {
  try {
    const consultants = await Consultant.find().sort({ createdAt: 1, nama: 1 });

    res.status(200).json({
      status: "success",
      message: "Consultant list successfully retrieved.",
      data: consultants,
    });
  } catch (error) {
    next(error);
  }
};

const getConsultantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultant = await Consultant.findOne({ id });

    if (!consultant) {
      return res.status(404).json({
        status: "error",
        message: "Consultant not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Consultant detail successfully retrieved.",
      data: consultant,
    });
  } catch (error) {
    next(error);
  }
};

const createConsultant = async (req, res, next) => {
  try {
    const normalizedPayload = normalizeConsultantPayload(req.body);
    const errors = validateConsultantPayload(normalizedPayload);

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid consultant payload.",
        errors,
      });
    }

    const newConsultantPayload = await sanitizeConsultantPayload(normalizedPayload, null, {
      allowCustomId: false,
    });

    if (req.file) {
      const uploadedPhoto = await uploadConsultantPhoto(newConsultantPayload.id, req.file);
      newConsultantPayload.photoUrl = uploadedPhoto.photoUrl;
      newConsultantPayload.photoStorageKey = uploadedPhoto.photoStorageKey;
    }

    const newConsultant = await Consultant.create(newConsultantPayload);

    return res.status(201).json({
      status: "success",
      message: "Consultant successfully created.",
      data: newConsultant,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Consultant id already exists.",
      });
    }

    next(error);
  }
};

const updateConsultant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentConsultant = await Consultant.findOne({ id }).select("+photoStorageKey");
    const normalizedPayload = normalizeConsultantPayload(req.body);

    if (!currentConsultant) {
      return res.status(404).json({
        status: "error",
        message: "Consultant not found.",
      });
    }

    const errors = validateConsultantPayload(normalizedPayload, { isUpdate: true });

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid consultant payload.",
        errors,
      });
    }

    const updatedPayload = await sanitizeConsultantPayload(normalizedPayload, currentConsultant);
    const shouldRemovePhoto = normalizedPayload.removePhoto === "true" || normalizedPayload.removePhoto === true;

    if (shouldRemovePhoto && currentConsultant.photoStorageKey) {
      await deleteConsultantPhoto(currentConsultant.photoStorageKey);
      updatedPayload.photoUrl = null;
      updatedPayload.photoStorageKey = null;
    }

    if (req.file) {
      if (currentConsultant.photoStorageKey) {
        await deleteConsultantPhoto(currentConsultant.photoStorageKey);
      }

      const uploadedPhoto = await uploadConsultantPhoto(updatedPayload.id, req.file);
      updatedPayload.photoUrl = uploadedPhoto.photoUrl;
      updatedPayload.photoStorageKey = uploadedPhoto.photoStorageKey;
    }

    const updatedConsultant = await Consultant.findOneAndUpdate(
      { id },
      updatedPayload,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Consultant successfully updated.",
      data: updatedConsultant,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Consultant id already exists.",
      });
    }

    next(error);
  }
};

const deleteConsultant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedConsultant = await Consultant.findOneAndDelete({ id });

    if (!deletedConsultant) {
      return res.status(404).json({
        status: "error",
        message: "Consultant not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Consultant successfully deleted.",
      data: deletedConsultant,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getConsultants,
  getConsultantById,
  createConsultant,
  updateConsultant,
  deleteConsultant,
};
