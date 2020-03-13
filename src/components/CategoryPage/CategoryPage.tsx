import React from 'react'
import './CategoryPage.css'
import Card from '../Card/Card'
import axios from 'axios'
import ErrorBoundary from "../Errorboundry/errorboundry";
import { ThemeConsumer } from 'styled-components';

interface Props {
    // color: string
}

interface State {
    pokemons:
    {
        name: string,
        url: string,
        imgUrl: string,
    }[],

}

export default class CategoryPage extends React.Component<Props, State> {
    readonly categoryName = "green"

    constructor(props: Props) {
        super(props)

        this.state = {
            pokemons: [],
        }
    }

    async pokemonApi() {
        const getPokemonCategoryURL = "https://pokeapi.co/api/v2/pokemon-color"
        const res = await axios.get(getPokemonCategoryURL)

        const category = res.data.results.find((catObj: any) => catObj.name === this.categoryName)
        const res2 = await axios.get(category.url)

        console.log(res2.data.pokemon_species)

        this.setState({ pokemons: res2.data.pokemon_species })

        const PokemonData = await (await axios.all(res2.data.pokemon_species)).map(pokemon => {
            const pokemonRecord = pokemon.url)
    }

    getPokemon(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    resolve(data);
                })
        })
    }

    async componentDidMount() {
        this.pokemonApi()
    }

    // async componentDidUpdate(prevProps: Props) {
    //     if (this.props.color !== prevProps.color)
    // }
    toFavourite() {

    }

    render() {
        return (
            <ErrorBoundary>
                <div className="category_container">
                    {
                        this.state.pokemons ? (
                            <div className="containers">
                                {this.state.pokemons.map(pokemon => (
                                    <Card name={pokemon.name} pokemonId={pokemon.url} handleFavourite={this.toFavourite} />
                                ))}
                            </div>
                        ) : (
                                <h1>loading...</h1>
                            )
                    }
                </div>
            </ErrorBoundary>
        )
    }
}
