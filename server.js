const mongoose = require("mongoose")
const Document = require("./Document")

const connectDatabase = async () => {
    try {
     
      await mongoose.connect("mongodb+srv://zeadhani:1234560@cluster0.dnpcx.mongodb.net/test?retryWrites=true&w=majority");
  
      console.log("connected to database");
    } catch (error) {
      console.log(error);
    }
  };
  
  connectDatabase();

const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
