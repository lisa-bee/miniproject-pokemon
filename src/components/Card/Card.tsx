import React from "react"
import "./Card.css"
import unLike from "./pokeball.png"
import liked from "./pokemon.png"
import Modal from "../Modal/modal"
import "../Modal/modal.css"
import axios from 'axios'
import Spinner from "../Spinner/Spinner"

import PokemonGeneral from "../PokemonGeneral/PokemonGeneral"
import PokemonStats from "../PokemonStats/PokemonStats"
import PokemonProfile from "../PokemonProfile/PokemonProfile"

import { State } from "../Interfaces"
import { SpeciesResults } from "../Interfaces"
import { Results } from "../Interfaces"

import { Pokemon } from "../App/App"

interface Props {
    name: string
    pokemonUrl: string
    pokemonIndex: number
    isFavourite: boolean
    addPokemon: (pokemon: Pokemon) => void
}


export default class Card extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        let imgUrl = `https://github.com/PokeAPI/sprites/blob/master/sprites/pokemon/${props.pokemonIndex}.png?raw=true`

        this.state = {
            loading: true,
            pokemonIndex: props.pokemonIndex,
            imgUrl,
            pokemonName: "",
            pokemonUrl: "",
            showModal: false,
            types: [],
            description: "",
            catchRate: 0,
            eggGroups: "",
            hatchSteps: 0,
            height: "",
            weight: "",
            abilities: [],
            evs: "",
            stats: {
                hp: 0,
                attack: 0,
                defense: 0,
                speed: 0,
                specialAttack: 0,
                specialDefense: 0
            }
        }
        this.handleLike = this.handleLike.bind(this)
    }

    handleLike() {
        this.props.addPokemon({ name: this.props.name, index: this.state.pokemonIndex, imgUrl: this.state.imgUrl })
    }

    handleImageLoad = () => {
        this.setState({
            loading: false
        })
    }

    async componentDidMount() {
        const pokemonUrl = this.props.pokemonUrl
        const url = "https://pokeapi.co/api/v2/pokemon/" + this.state.pokemonIndex

        const res = await axios.get<Results>(url)

        const height = res.data.height
        const weight = res.data.weight
        const types = res.data.types.map(type => type.type.name)
        const abilities = res.data.abilities.map(ability => {
            return this.capitalizeWord(ability.ability.name)
        })
        const evs = res.data.stats.filter(stat => {
            if (stat.effort > 0) {
                return true
            }
            return false
        }).map(stat => {
            return `${stat.effort} ${stat.stat.name
                .toLowerCase()
                .split('-')
                .map(s => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ')}`
        }).join(', ')

        let hp: number = 0
        let attack: number = 0
        let defense: number = 0
        let speed: number = 0
        let specialAttack: number = 0
        let specialDefense: number = 0

        res.data.stats.map(stat => {
            switch (stat.stat.name) {
                case 'hp':
                    hp = stat['base_stat']
                    break
                case 'attack':
                    attack = stat['base_stat']
                    break
                case 'defense':
                    defense = stat['base_stat']
                    break
                case 'speed':
                    speed = stat['base_stat']
                    break
                case 'special-attack':
                    specialAttack = stat['base_stat']
                    break
                case 'special-defense':
                    specialDefense = stat['base_stat']
                    break
            }
        })

        this.setState({
            height,
            weight,
            types,
            abilities,
            evs,
            stats: {
                hp,
                attack,
                defense,
                speed,
                specialAttack,
                specialDefense
            }
        })

        await axios.get<SpeciesResults>(pokemonUrl).then(res => {
            let description = ""
            res.data.flavor_text_entries.some(flavor => {
                if (flavor.language.name === "en") {
                    description = flavor.flavor_text
                    return
                }
            })

            const catchRate = Math.round((100 / 255) * res.data['capture_rate'])

            const eggGroups = res.data['egg_groups'].map(group => {
                return group.name
            }).join(", ")

            const hatchSteps = 255 * (res.data['hatch_counter'] * 1)

            this.setState({
                description,
                catchRate,
                eggGroups,
                hatchSteps,
                types,
                height,
                weight,
            })
        })
    }

    private capitalizeWord = (str: string) => {
        if (str.length === 0) return ""
        str = str.replace("-", " ")
        return str[0].toUpperCase() + str.slice(1)
    }

    private toggleModal = () => {
        this.setState({
            showModal: !this.state.showModal
        })
    }

    private get modal() {
        if (this.state.showModal) {
            return (
                <Modal>
                    <div className="modal_container" onClick={this.toggleModal}>
                        <PokemonGeneral pokemonName={this.props.name} pokemonIndex={this.state.pokemonIndex}
                            imgUrl={this.state.imgUrl} types={this.state.types} description={this.state.description} />
                        <PokemonStats hp={this.state.stats.hp} attack={this.state.stats.attack} defense={this.state.stats.attack}
                            speed={this.state.stats.speed} specialAttack={this.state.stats.specialAttack} specialDefense={this.state.stats.specialDefense} />
                        <PokemonProfile height={this.state.height} weight={this.state.weight} eggGroups={this.state.eggGroups} abilities={this.state.abilities}
                            evs={this.state.evs} hatchSteps={this.state.hatchSteps} catchRate={this.state.catchRate} />
                        <button className="myButton" onClick={this.toggleModal}>Close</button>
                    </div>
                </Modal >
            )
        }
        return undefined
    }

    render() {
        // const pokemonIndex = this.state.pokemonIndex
        const theImgs = this.props.isFavourite ? <img className="pokeLike" src={liked} alt="Noliked" /> : <img className="pokeLike" src={unLike} alt="liked" />
        return (
            <>
                <div className="cardContainer">
                    <div className="pokeball" onClick={() => this.handleLike()}>
                        <h2>
                            {theImgs}
                        </h2>
                    </div>
                    {this.state.loading ?<Spinner/>: null}
                    <img onClick={this.toggleModal} onLoad={this.handleImageLoad} className="imgStyle" src={this.state.imgUrl} alt="A pokemon" />
                    <h1>{this.props.name.charAt(0).toUpperCase() + this.props.name.slice(1)}</h1>
                    <h6>Index:{this.state.pokemonIndex}</h6>
                </div>
                {this.modal}
            </>
        )
    }
}