import mongoose from 'mongoose'

const MatchesScheme = new mongoose.Schema(
    {
        date:{
            type:Date
        },
        competition:{
            type:String
        },
        season:{
            type:String
        },
        stage:{
            type:String
        },
        title_match:{
            type:String
        },
        path_video:{
            type:String
        }
    },
    {
        // MARCAS DE TIEMPO
        timestamps:true,
        versionKey:false
    }
)

export default mongoose.model('matches',MatchesScheme)