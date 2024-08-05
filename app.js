import 'dotenv/config'
import express from 'express'
import vectorSearch from './vectorise.js'

const app = express()

app.use(express.static('public'))
app.use(express.json())

app.get('/vector', async (req, res) => {
    const {query} = req.query

    const data = await vectorSearch(query)

    res.send(data)
})

app.listen(3000, ()=>{console.log('listening')})